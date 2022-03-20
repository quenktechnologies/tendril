import * as express from 'express';
import { Object } from '@quenk/noni/lib/data/jsonx';
import { Type } from '@quenk/noni/lib/data/type';
import { Record } from '@quenk/noni/lib/data/record';
import { Case } from '@quenk/potoo/lib/actor/resident/case';
import { Immutable } from '@quenk/potoo/lib/actor/resident/immutable';
import { Request, Filter, ErrorFilter } from '../api/request';
import { App } from '../';
/**
 * Messages supported by modules.
 */
export declare type Messages<M> = Disable | Enable | Redirect | M;
/**
 * Path
 */
export declare type Path = string;
/**
 * Method
 */
export declare type Method = string;
/**
 * PathConf is an object where the key is a URL path and the value a
 * [[MethodConf]] object containing routes for the desired HTTP methods.
 */
export interface PathConf extends Record<MethodConf> {
}
/**
 * MethodConf is an object where the key is a supported HTTP method and
 * the value the route configuration to use for that method.
 */
export interface MethodConf extends Record<RouteConf[]> {
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
     * filters applied when the route is executed.
     */
    filters: Filter<Type>[];
    /**
     * tags is an object containing values set on the Request by the routing
     * configuration.
     *
     * These are useful for distinguishing what action take in common filters.
     */
    tags: Object;
}
/**
 * RoutingInfo holds all the Module's routing information.
 */
export interface RoutingInfo {
    /**
     * before is those Filters that will be executed before all others.
     */
    before: Filter<Type>[];
    /**
     * routes is the [[PathConf]] for those Filters that are executed based
     * on the incoming request.
     */
    routes: PathConf;
}
/**
 * Disable a Module.
 *
 * All requests to the Module will 404.
 */
export declare class Disable {
}
/**
 * Enable a Module.
 */
export declare class Enable {
}
/**
 * Redirect requests to the module to another location.
 */
export declare class Redirect {
    status: number;
    location: string;
    constructor(status: number, location: string);
}
/**
 * Module of a tendril application.
 *
 * In tendril, an application is broken up into one more Modules that
 * represent the respective areas of concern. Modules are responsible
 * for configuring and handling their assigned routes (endpoints) in the
 * application and can communicate with each other via the actor API.
 *
 * Think of all the routes of a Module as one big function that pattern
 * matches incoming requests.
 */
export declare class Module extends Immutable<Messages<any>> {
    app: App;
    routeInfo: RoutingInfo;
    constructor(app: App, routeInfo?: RoutingInfo);
    receive(): Case<Messages<Type>>[];
    /**
     * runInContext given a final RouteConf, produces an express request handler
     * that executes each filter sequentially.
     */
    runInContext: (route: RouteConf) => express.RequestHandler;
    /**
     * runIn404Context is used when a 404 handler filter is installed.
     */
    runIn404Context: (filter: Filter<Type>) => express.RequestHandler;
    /**
     * runInContextWithError is used when an error occurs during request
     * handling.
     */
    runInContextWithError: (filter: ErrorFilter) => express.ErrorRequestHandler;
    /**
     * runInCSRFErrorContext is used for CSRF error handling.
     */
    runInCSRFErrorContext: (filters: Filter<Type>[]) => (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => void;
    /**
     * addBefore adds filters to the RoutingInfo that will be executed
     * before every route.
     */
    addBefore(filter: Filter<Type>): Module;
    /**
     * addRoute to the internal routing table of this Module.
     *
     * These routes are later installed to the result of getRouter().
     */
    addRoute(conf: RouteConf): Module;
    /**
     * addRoutes
     * @deprecated
     */
    addRoutes(routes: RouteConf[]): Module;
    disable(): void;
    enable(): void;
    redirect(location: string, status: number): void;
    /**
     * show constructors a Filter for displaying a view.
     */
    show(name: string, ctx?: object): Filter<undefined>;
    /**
     * getRouter provides the [[express.Router]] for the Module.
     */
    getRouter(): express.Router;
    run(): void;
}
