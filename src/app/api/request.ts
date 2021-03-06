import * as express from 'express';

import { Value } from '@quenk/noni/lib/data/jsonx';
import { Record } from '@quenk/noni/lib/data/record';

import { SessionStorage, EnabledSessionStorage } from './storage/session';
import { PRSStorage } from './storage/prs';
import { Action } from './';

/**
 * Method
 */
export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * Filter functions are applied to the request.
 * 
 * These can either transform the request or terminate.
 */
export type Filter<A> = (r: Request) => Action<A>;

/**
 * ErrorFilter functions are applied to a request when it triggers an error.
 */
export type ErrorFilter = (e: Error, r: Request) => Action<void>;

/**
 * CookieData is a record containing key value pairs of parsed cookies.
 */
export interface CookieData extends Record<string | string[]> { }

/**
 * Request represents a client request.
 */
export interface Request {

    /**
     * method of the request.
     */
    method: string,

    /**
     * url of the request.
     */
    url: string,

    /**
     * path of the request.
     */
    path: string,

    /**
     * params is an object containing properties mapped the named route
     * “parameters”.
     */
    params: Record<string>,

    /**
     * query string of the request parsed into an object.
     *
     * This should NEVER be used directly without proper validation as it
     * is based on user input. 
     *
     * Empty object if query string parsing is disabled.
     */
    query: Record<string>

    /**
     * body of the request.
     * 
     * The actual value depends on the body parser middleware enabled.
     */
    body: Value,

    /**
     * cookies sent with the request if the cookie parser is enabled.
     *
     * Empty object otherwise.
     */
    cookies: CookieData,

    /**
     * signedCookies sent with the request if cookie parsing and signing is 
     * enabled.
     *
     * Empty object otherwise.
     */
    signedCookies: CookieData,

    /**
     * hostname derived from the Host HTTP header.
     */
    hostname: string,

    /**
     * remoteAddress of the request originator.
     */
    remoteAddress: string,

    /**
     * protocol of the request.
     */
    protocol: string,

    /**
     * prs storage instance for the Request.
     */
    prs: PRSStorage,

    /**
     * session storage instance for the Request.
     */
    session: SessionStorage,

    /**
     * toExpress provides the **express** framework request object.
     */
    toExpress(): express.Request

}

/**
 * ClientRequest class.
 */
export class ClientRequest implements Request {

    constructor(
        public method: string,
        public url: string,
        public path: string,
        public params: Record<string>,
        public query: Record<string>,
        public body: Value,
        public cookies: CookieData,
        public signedCookies: CookieData,
        public hostname: string,
        public remoteAddress: string,
        public protocol: string,
        public prs: PRSStorage,
        public session: SessionStorage,
        public expressRequest: express.Request) { }

    /**
     * fromExpress constructs a ClientRequest from the express framework's
     * Request object.
     */
    static fromExpress(r: express.Request) {

        return new ClientRequest(
            r.method,
            r.url,
            r.path,
            r.params,
            <Record<string>>r.query,
            r.body,
            r.cookies,
            r.signedCookies,
            r.hostname,
            r.ip,
            r.protocol,
            new PRSStorage(),
            EnabledSessionStorage.fromExpress(r),
            r);

    }

    toExpress() {

        return this.expressRequest;

    }

}
