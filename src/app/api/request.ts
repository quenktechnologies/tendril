import * as express from 'express';

import { Api } from '@quenk/potoo/lib/actor/api';
import { Object, Value } from '@quenk/noni/lib/data/jsonx';
import { clone, Record } from '@quenk/noni/lib/data/record';

import { SessionStorage, EnabledSessionStorage } from './storage/session';
import { PRSStorage } from './storage/prs';
import { CookieStorage } from './storage/cookie';
import { RouteConf } from '../conf';
import { Response } from './response';

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
     * actor handling the received request.
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
    route?: RouteConf;
}

/**
 * DefaultRequestMessage implementation.
 */
export class DefaultRequestMessage implements RequestMessage {
    constructor(
        public method: string,
        public path: string,
        public url: string,
        public params: Record<string>,
        public query: Record<string>,
        public body: Value,
        public cookies: CookieStorage,
        public hostname: string,
        public remoteAddress: string,
        public protocol: string,
        public prs: PRSStorage,
        public session: SessionStorage,
        public route?: RouteConf
    ) {}
}

/**
 * fromExpress constructs a ClientRequest from the express framework's
 * Request object.
 */
export const mkRequestMessage = (
    req: express.Request,
    res: express.Response,
    route?: RouteConf
): RequestMessage => {
    return new DefaultRequestMessage(
        req.method,
        req.path,
        req.url,
        req.params,
        <Record<string>>req.query,
        req.body,
        new CookieStorage(req.cookies, res),
        req.hostname,
        req.ip || '',
        req.protocol,
        new PRSStorage(clone({ tags: route?.tags ?? [] })),
        EnabledSessionStorage.fromExpress(req),
        route
    );
};
