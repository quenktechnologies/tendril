import * as express from 'express';
import * as morgan from 'morgan';
import * as vm from '@quenk/potoo/lib/actor/system/vm/conf';
import * as parser from 'body-parser';
import * as session from 'express-session';

import { CookieParseOptions } from 'cookie-parser';

import { Path } from '@quenk/noni/lib/io/file';
import { Record } from '@quenk/noni/lib/data/record';
import { Type } from '@quenk/noni/lib/data/type';
import { Object } from '@quenk/noni/lib/data/jsonx';

import { Provider } from './middleware/session/store/connection';
import { Middleware } from './middleware';
import { Filter, Handler, Method } from './api/request';
import { Show } from './api/response';
import { Connection } from './connection';
import { ModuleInfo } from './module';
import { EventListener } from './events';

/**
 * AppConf holds the bulk of the configuration directives for a tendril app.
 *
 * Most directives here are also honoured at the module level with a few
 * such as "vm" only applying to the top level module.
 */
export interface AppConf {
    /**
     * path to mount the http routes of the module.
     *
     * This allows the path used for express to be overriden.
     */
    path?: string;

    /**
     * vm allows for configuration of the PVM.
     *
     * Note that these directives are only honored at the top level module.
     *
     * (top-level only)
     */
    vm?: vm.Conf;

    /**
     * server configuration settings for the HTTP server.
     *
     * (top-level only)
     */
    server?: ServerConf;

    /**
     * connections to open when the app starts.
     */
    connections?: Record<ConnectionConf>;

    /**
     * log (HTTP) configuration.
     */
    log?: LogConf;

    /**
     * session configuration.
     */
    session?: SessionConf;

    /**
     * csrf prevention configuration.
     */
    csrf?: CSRFConf;

    /**
     * parsers (HTTP) configuration.
     */
    parsers?: {
        /**
         * body parser configuration.
         */
        body?: BodyParserConf;

        /**
         * cookie parser configuration.
         */
        cookie?: CookieParserConf;
    };

    /**
     * middleware (framework) configuration.
     */
    middleware?: {
        /**
         * available middleware that can be specified in the enabled list.
         */
        available?: AvailableMiddleware;

        /**
         * enabled middleware that will be installed on the framework app
         * when starting.
         */
        enabled?: (string | Middleware)[];
    };

    /**
     * views confguration for rendering views from templates.
     */
    views?: ShowConf;

    /**
     * filters (HTTP) to apply to all requests.
     */
    filters?: Filter[];

    /**
     * routing configuration for the module.
     */
    routing?: {
        /**
         * dirs to serve static files from.
         */
        dirs?: StaticConf;

        /**
         * routes provides the HTTP route configuration.
         */
        routes?: (m: ModuleInfo) => RouteConf[];

        on?: {
            /**
             * error is invoked when the framework has encountered an error during
             * routing for a request.
             */
            error?: Handler;

            /**
             * notFound is invoked when the configured module finds no routes to execute
             * for a request.
             */
            none?: Handler;
        };
    };

    /**
     * on allows the confguration of hooks into the the lifecycle of the app.
     */
    on?: {
        /**
         * init is invoked before the application is configured.
         */
        init?: EventListener | EventListener[];
        /**
         * connected is invoked when all connections have been established.
         */
        connected?: EventListener | EventListener[];

        /**
         * started is invoked when the application is ready to serve requests.
         */
        started?: EventListener | EventListener[];
    };
}

/**
 * Connector used to create a system managed connection.
 */
export type Connector = (...options: Type[]) => Connection;

/**
 * ConnectionConf declares the configuration for a remote service connections.
 */
export interface ConnectionConf {
    /**
     * connector used.
     */
    connector: Connector;

    /**
     * options (if any).
     */
    options?: Type[];
}

/**
 * LogConf can be configured to log each HTTP request as they come in.
 */
export interface LogConf {
    /**
     * enable if true will enable the logging middleware.
     */
    enable?: boolean;

    /**
     * format is a valid format string the morgan middleware can use for logging
     * HTTP requests.
     */
    format?: string;

    /**
     * options that can be additionally passed to the morgan middleware.
     */
    options?: morgan.Options<express.Request, express.Response>;
}

/**
 * CSRFConf can be configured to enabled cross-site request forgery
 * protection.
 */
export interface CSRFConf {
    /**
     * enable if true will enable csrf protection.
     */
    enable?: boolean;

    /**
     * send_cookie if true will send a cookie to the client on each read
     * request containing the value of the current token.
     * Note: This is not the double submit pattern but rather a way for XHR
     * requests to retrieve the token.
     */
    send_cookie?: boolean;

    /**
     * send_cookie_name if set will be used as the name of the cookie used
     * to send the token value.
     *
     * Defaults to DEFAULT_SEND_COOKIE_NAME.
     */
    send_cookie_name?: string;

    /**
     * options passed on to the middleware.
     */
    options?: object;

    /**
     * on hooks.
     */
    on?: {
        /**
         * error is invoked to handle the response if the CSRF token is missing or invalid.
         */
        error?: Handler;
    };
}

/**
 * BodyParserConf can be configured to enabled various request body parsing
 * algorithims.
 */
export interface BodyParserConf {
    /**
     * json configures parsing for json body types.
     */
    json?: {
        /**
         * enable this parser.
         */
        enable?: boolean;

        /**
         * options for the parser.
         */
        options?: parser.OptionsJson;
    };

    /**
     * raw configures parsing of the body into a Buffer.
     */
    raw?: {
        /**
         * enable this parser.
         */
        enable?: boolean;

        /**
         * options for this parser.
         */
        options?: parser.Options;
    };

    /**
     * text configures parsing of the body as text.
     */
    text?: {
        /**
         * enable this parser.
         */
        enable?: boolean;

        /**
         * options for this parser.
         */
        options?: parser.OptionsText;
    };

    /**
     * urlencoded configures parsing the body as url-encoded text.
     */
    urlencoded?: {
        /**
         * enable this parser.
         */
        enable?: boolean;

        /**
         * options for this parser.
         */
        options?: parser.OptionsUrlencoded;
    };
}

/**
 * CookieParserConf can be configured to enabled parsing of the Cookie header.
 */
export interface CookieParserConf {
    /**
     * enable this parser.
     */
    enable?: boolean;

    /**
     * secret used to sign cookies.
     *
     * If not specified is read from the following:
     * 1) process.env.COOKIE_SECRET
     * 2) process.env.SECRET
     * 3) a random generated string.
     *
     * If the 3rd option is used, cookies will not be valid after the
     * application restarts!
     */
    secret?: string;

    /**
     * options for the parser.
     */
    options?: CookieParseOptions;
}

/**
 * SessionConf contains settings for configuring session usage.
 */
export interface SessionConf {
    /**
     * enable if true, will turn on session support.
     *
     * Defaults to true.
     */
    enable?: boolean;

    /**
     * options configurable for the session module.
     */
    options?: session.SessionOptions;

    /**
     * store configuration for the session.
     */
    store?: {
        /**
         * provider used to create the SessionStoreConnection object.
         *
         * If unspecified, the inefficient in memory store will be used.
         */
        provider: Provider;

        /**
         * options passed to the Provider
         */
        options?: object;
    };
}

/**
 * MiddlewareProvider is a function that provides Middleware.
 */
export type MiddlewareProvider = (...options: Type[]) => Middleware;

/**
 * AvailableMiddleware declares the middleware that can be configured and
 * used.
 */
export interface AvailableMiddleware {
    [key: string]: MiddlewareConf;
}

/**
 * MiddlewareConf allows express middleware to be configured for a module.
 */
export interface MiddlewareConf {
    /**
     * provider for the middleware.
     */
    provider: MiddlewareProvider;

    /**
     * options to pass to the provider.
     */
    options?: Type[];
}

/**
 * StaticConf is the configuration for one or more static directories.
 */
export type StaticConf = Record<StaticDirConf | StaticDirConf[]>;

/**
 * StaticDirConf is the configuration for a single static directory.
 */
export type StaticDirConf = ShortStaticDirConf | FullStaticDirConf;

/**
 * ShortStaticDirConf just specifies the path to a static directory.
 */
export type ShortStaticDirConf = Path;

/**
 * FullStaticDirConf specifies the path to a static directory and optional
 * options.
 */
export interface FullStaticDirConf {
    /**
     * path to serve static files from.
     */
    path: Path;

    /**
     * options passed directly to the serve-static middleware.
     */
    options?: object;
}

/**
 * ShowProvider is a function that will provide a Show.
 */
export type ShowProvider = (...options: Type[]) => Show;

/**
 * ShowConf allows the show function for a module to be configured.
 */
export interface ShowConf {
    /**
     * provider for the Show.
     */
    provider: ShowProvider;

    /**
     * options passed to the provider (optionally).
     */
    options?: Type[];
}

/**
 * RouteConf describes a route to be installed in the application.
 */
export interface RouteConf {
    /**
     * method of the route.
     */
    method: Method;

    /**
     * path of the route.
     */
    path: Path;

    /**
     * tags is an object containing values set on the Request by the routing
     * configuration.
     *
     * These are useful for distinguishing what action take in common filters.
     */
    tags: Object;

    /**
     * filters applied when the route is executed.
     */
    filters: FilterChain
   }

/**
 * FilterChain is always terminated with a Handler.
 */
export type FilterChain = [...Filter[], Handler];


/**
 * ServerConf for a server.
 *
 * Matches the options argument of http.Server#listen
 */
export interface ServerConf {
    /**
     * port to bind to.
     */
    port: number | string;

    /**
     * host to bind to.
     */
    host: string;
}
