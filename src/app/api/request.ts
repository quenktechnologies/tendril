import * as express from 'express';

import { Object, Value } from '@quenk/noni/lib/data/jsonx';
import { merge, Record } from '@quenk/noni/lib/data/record';
import { isObject } from '@quenk/noni/lib/data/type';

import {
    SessionStorage,
    EnabledSessionStorage,
    DisabledSessionStorage,
    SESSION_DATA
} from './storage/session';
import { PRSStorage } from './storage/prs';
import { Action } from './';
import { RouteConf } from '../module';

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
 * PartialRequest describes the properties that can be specified to intialize
 * a new Request instance from partial data.
 */
export interface PartialRequest extends Partial<express.Request> {

    /**
     * routeConf specifies the route configuration that would have yielded this
     * request.
     */
    routeConf?: RouteConf

    /**
     * prsData specifies the PRSStorage instance to use or an object that will 
     * be used as initial data.
     */
    prsData?: PRSStorage | Object,

    /**
     * sessionStorage specifies the SessionStorage instance to use or an object
     * that will be used as initial data.
     */
    sessionData?: SessionStorage | Object

}

/**
 * Request represents a client request.
 */
export interface Request {

    /**
     * method of the request.
     */
    method: string,

    /**
     * path of the request.
     */
    path: string,

    /**
     * url of the request.
     */
    url: string,

    /**
     * params is an object containing properties mapped the named route
     * “parameters”.
     */
    params: Record<string>,

    /**
     * query string of the request parsed into an object.
     *
     * This should NEVER be used directly without first proper validating 
     * because it is based on user input. Object is used here so middleware and
     * filters can shape it as needed.
     *
     * Empty object if query string parsing is disabled.
     */
    query: Object

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
     * route is the RouteConf object that was used to generate the Request.
     */
    route: RouteConf,

    /**
     * toExpress provides the **express** framework request object.
     */
    toExpress(): express.Request

}

const defaults: PartialRequest = {
    routeConf: {
        method: 'get',
        path: '/',
        filters: [],
        tags: {},
    },
    method: 'GET',
    path: '/',
    url: 'example.com',
    params: {},
    query: {},
    body: {},
    cookies: {},
    signedCookies: {},
    hostname: 'example.com',
    ip: '127.0.0.1',
    protocol: 'http',
    prsData: {},
    sessionData: {},
}

/**
 * ClientRequest class.
 */
export class ClientRequest implements Request {

    constructor(
        public route: RouteConf,
        public method: string,
        public path: string,
        public url: string,
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
    static fromExpress(r: express.Request, route: RouteConf): ClientRequest {

        return new ClientRequest(
            route,
            r.method,
            r.path,
            r.url,
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

    /**
     * fromPartial produces a ClientRequest using defaults merged with the 
     * specified PartialRequest.
     *
     * This method exists mainly for testing and should not be use in production.
     */
    static fromPartial(req: PartialRequest): ClientRequest {

        let opts = merge(defaults, req);

        opts.prsData = (isObject(opts.prsData) &&
            (opts.prsData instanceof PRSStorage)) ?
            opts.prsData :
            new PRSStorage(opts.prsData || {})

        opts.sessionData = isObject(opts.sessionData) &&
            (opts.sessionData instanceof EnabledSessionStorage) ||
            (opts.sessionData instanceof DisabledSessionStorage) ?
            opts.sessionData :
            new EnabledSessionStorage({
              [SESSION_DATA]:<Object>opts.sessionData || {}
            });

        let r = <express.Request>opts;

        return new ClientRequest(
            <RouteConf>opts.routeConf,
            r.method,
            r.path,
            r.url,
            r.params,
            <Record<string>>r.query,
            r.body,
            r.cookies,
            r.signedCookies,
            r.hostname,
            r.ip,
            r.protocol,
            <PRSStorage>opts.prsData,
            <SessionStorage>opts.sessionData,
            r);

    }

    toExpress() {

        return this.expressRequest;

    }

}
