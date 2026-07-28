import * as express from 'express';

import { Api } from '@quenk/potoo/lib/actor/api';
import { Object, Value } from '@quenk/noni/lib/data/jsonx';
import { clone, Record } from '@quenk/noni/lib/data/record';
import {
    Path as RecordPath,
    unsafeGet
} from '@quenk/noni/lib/data/record/path';

import { SessionStorage, EnabledSessionStorage } from './session';
import { PRSStorage } from './prs';
import { CookieStorage } from './cookie';
import { RouteConf } from '../conf';
import { notFound, Response } from './response';
import type { App as AppInstance } from '../';
import type { ModuleInfo } from '../module';

/**
 * Method
 */
export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * Filter is a function executed on incomming requests before the handler
 * for the route is executed.
 *
 * If a Filter returns a response, it signals to the executor that the chain
 * should be aborted and the response returned to the client.
 */
export type Filter = (ctx: RequestContext) => Promise<void | Response>;

/**
 * Handler is the final function executed in the chain for the route.
 *
 * This is where the business logic should be implemented.
 */
export type Handler = (ctx: RequestContext) => Promise<Response>;

/**
 * RequestContext respresents the context the request is processed in.
 */
export interface RequestContext {
    /**
     * request message received from the client.
     */
    request: RequestMessage;

    /**
     * app instance for the running app.
     */
    app: AppInstance;

    /**
     * module handling the request.
     */
    module: ModuleInfo;

    /**
     * actor handling the received request.
     *
     * @deprecated
     */
    actor: Api;

    /**
     * framework objects used to access express APIs.
     */
    framework: FrameworkRequest;
}

/**
 * FrameworkRequest are the objects the underlying framework provdides for
 * handling requests.
 */
export interface FrameworkRequest {
    request: express.Request;
    response: express.Response;
}

/**
 * RequestUser is the authenticated user information attached to a Request.
 */
export type RequestUser = Object & { id: string | number };

/**
 * RequestMessage respresents the request the client made to the app.
 */
export interface RequestMessage {
    /**
     * method of the request.
     */
    method: string;

    /**
     * path of the request.
     */
    path: string;

    /**
     * url of the request.
     */
    url: string;

    /**
     * params is an object containing properties mapped the named route
     * “parameters”.
     */
    params: Record<string>;

    /**
     * query string of the request parsed into an object.
     *
     * This should NEVER be used directly without first proper validating
     * because it is based on user input. Object is used here so middleware and
     * filters can shape it as needed.
     *
     * Empty object if query string parsing is disabled.
     */
    query: Object;

    /**
     * body of the request.
     *
     * The actual value depends on the body parser middleware enabled.
     */
    body: Value;

    /**
     * values proxy reads/writes directly from/to the PRS storage.
     */
    values: Object;

    /**
     * authenticated user information if available.
     */
    user?: RequestUser;

    /**
     * cookies sent with the request if the cookie parser is enabled.
     */
    cookies: CookieStorage;

    /**
     * hostname derived from the Host HTTP header.
     */
    hostname: string;

    /**
     * remoteAddress of the request originator.
     */
    remoteAddress: string;

    /**
     * protocol of the request.
     */
    protocol: string;

    /**
     * prs storage instance for the Request.
     */
    prs: PRSStorage;

    /**
     * session storage instance for the Request.
     */
    session: SessionStorage;

    /**
     * route is the RouteConf object that was used to generate the Request.
     */
    route: RouteConf;

    /**
     * original request object from the framework.
     */
    original: express.Request;
}

export type Request = RequestMessage;

/**
 * DefaultRequestMessage implementation.
 */
export class DefaultRequestMessage implements RequestMessage {
    public values: Object;

    constructor(
        public method: string,
        public path: string,
        public url: string,
        public params: Record<string>,
        public query: Record<string>,
        public body: Value,
        public user: RequestUser | undefined,
        public cookies: CookieStorage,
        public hostname: string,
        public remoteAddress: string,
        public protocol: string,
        public prs: PRSStorage,
        public session: SessionStorage,
        public route: RouteConf,
        public original: express.Request
    ) {
        this.values = prs.values;
    }
}

/**
 * fromExpress constructs a ClientRequest from the express framework's
 * Request object.
 */
export const mkRequestMessage = (
    req: express.Request,
    res: express.Response,
    route: RouteConf = {
        method: <'get'>req.method,
        path: req.path,
        tags: {},
        filters: [],
        handler: async () => notFound()
    }
): RequestMessage => {
    let { user } = <express.Request & { user?: RequestUser }>req;
    return new DefaultRequestMessage(
        req.method,
        req.path,
        req.url,
        req.params,
        <Record<string>>req.query,
        req.body,
        user,
        new CookieStorage(req.cookies, res),
        req.hostname,
        req.ip || '',
        req.protocol,
        new PRSStorage(clone({ tags: route?.tags ?? [] })),
        EnabledSessionStorage.fromExpress(req),
        route,
        req
    );
};

/**
 * extractDecorator produces a method decorator that appends a value
 * extracted from the RequestContext as an additional argument to the
 * decorated method, immediately after any arguments already added by
 * decorators applied before it (i.e. those declared below it, closer to the
 * method).
 */
const extractDecorator =
    <S>(source: (ctx: RequestContext) => S, path?: RecordPath) =>
    <T extends Function>(value: T, _context: ClassMethodDecoratorContext): T =>
        function (this: unknown, ...args: unknown[]) {
            let ctx = args[0] as RequestContext;
            let target = source(ctx);
            let extracted = path
                ? unsafeGet(path, target as unknown as Record<Value>)
                : target;
            return value.apply(this, [...args, extracted]);
        } as unknown as T;

/**
 * Param is a method decorator that injects a value from the current
 * request's route parameters as an additional argument to the decorated
 * method.
 *
 * Param, Query and Body can be combined on the same method. Extracted
 * values are appended as arguments in the order the decorators are
 * declared (top to bottom), immediately after the RequestContext.
 *
 * Usage:
 *   class UserController {
 *     @Get('/users/:id')
 *     @Param('id')
 *     async getUser(ctx: RequestContext, id: string): Promise<Response> { ... }
 *   }
 *
 * @param path - Optional property path into the params object. When
 *               omitted, the entire params object is provided.
 */
export const Param = (path?: RecordPath) =>
    extractDecorator(ctx => ctx.request.params, path);

/**
 * Query is a method decorator that injects a value from the current
 * request's query string as an additional argument to the decorated
 * method.
 *
 * See Param for details on how extraction decorators compose.
 *
 * @param path - Optional property path into the query object. When
 *               omitted, the entire query object is provided.
 */
export const Query = (path?: RecordPath) =>
    extractDecorator(ctx => ctx.request.query, path);

/**
 * Body is a method decorator that injects a value from the current
 * request's body as an additional argument to the decorated method.
 *
 * See Param for details on how extraction decorators compose.
 *
 * @param path - Optional property path into the body. When omitted, the
 *               entire body is provided.
 */
export const Body = (path?: RecordPath) =>
    extractDecorator(ctx => ctx.request.body, path);

/**
 * Request is a method decorator that injects the current RequestMessage as
 * an additional argument to the decorated method.
 *
 * See Param for details on how extraction decorators compose.
 *
 * @param path - Optional property path into the RequestMessage. When
 *               omitted, the entire RequestMessage is provided.
 */
export const Request = (path?: RecordPath) =>
    extractDecorator(ctx => ctx.request, path);

/**
 * App is a method decorator that injects the running App instance as an
 * additional argument to the decorated method.
 *
 * See Param for details on how extraction decorators compose.
 *
 * @param path - Optional property path into the App instance. When
 *               omitted, the entire App instance is provided.
 */
export const App = (path?: RecordPath) =>
    extractDecorator(ctx => ctx.app, path);

/**
 * Module is a method decorator that injects the ModuleInfo handling the
 * current request as an additional argument to the decorated method.
 *
 * See Param for details on how extraction decorators compose.
 *
 * @param path - Optional property path into the ModuleInfo. When omitted,
 *               the entire ModuleInfo is provided.
 */
export const Module = (path?: RecordPath) =>
    extractDecorator(ctx => ctx.module, path);

/**
 * Actor is a method decorator that injects the actor handling the current
 * request as an additional argument to the decorated method.
 *
 * See Param for details on how extraction decorators compose.
 *
 * @deprecated follows RequestContext#actor.
 *
 * @param path - Optional property path into the actor. When omitted, the
 *               entire actor is provided.
 */
export const Actor = (path?: RecordPath) =>
    extractDecorator(ctx => ctx.actor, path);

/**
 * Framework is a method decorator that injects the FrameworkRequest objects
 * as an additional argument to the decorated method.
 *
 * See Param for details on how extraction decorators compose.
 *
 * @param path - Optional property path into the FrameworkRequest object.
 *               When omitted, the entire FrameworkRequest object is
 *               provided.
 */
export const Framework = (path?: RecordPath) =>
    extractDecorator(ctx => ctx.framework, path);
