/**
 * This module provides functions for sending http responses.
 */
import * as status from './status';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Api, Action, Context } from '../';
import { Type } from '@quenk/noni/lib/data/type';
export declare const PRS_VIEW_CONTEXT = "$view.context";
/**
 * Headers map.
 */
export interface Headers {
    [key: string]: string;
}
/**
 * Response terminates the http request with an actual HTTP response.
 */
export declare abstract class Response<B, A> extends Api<A> {
    body: Maybe<B>;
    abort: boolean;
    next: A;
    constructor(body: Maybe<B>, abort: boolean, next: A);
    abstract status: status.Status;
    abstract map<AA>(f: (a: A) => AA): Response<B, AA>;
    marshal(body: B): Type;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * Header sets header values to send out.
 */
export declare class Header<A> extends Api<A> {
    headers: Headers;
    next: A;
    constructor(headers: Headers, next: A);
    map<B>(f: (a: A) => B): Header<B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * Accepted response.
 */
export declare class Accepted<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Accepted<B, AA>;
}
/**
 * BadRequest response.
 */
export declare class BadRequest<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): BadRequest<B, AA>;
}
/**
 * Conflict response.
 */
export declare class Conflict<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Conflict<B, AA>;
}
/**
 * Created response.
 */
export declare class Created<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Created<B, AA>;
}
/**
 * InternalServerError response.
 */
export declare class InternalServerError<B, A> extends Response<B, A> {
    status: number;
    marshal(value: B): "" | B;
    map<C>(f: (a: A) => C): InternalServerError<B, C>;
}
/**
 * Forbiddden response.
 */
export declare class Forbidden<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Forbidden<B, AA>;
}
/**
 * NoContent response.
 */
export declare class NoContent<A> extends Response<void, A> {
    abort: boolean;
    next: A;
    constructor(abort: boolean, next: A);
    status: number;
    map<B>(f: (a: A) => B): NoContent<B>;
}
/**
 * NotFound response.
 */
export declare class NotFound<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): NotFound<B, AA>;
}
/**
 * Ok action.
 */
export declare class Ok<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Ok<B, AA>;
}
/**
 * Redirect action.
 */
export declare class Redirect<A> extends Api<A> {
    url: string;
    code: number;
    abort: boolean;
    next: A;
    constructor(url: string, code: number, abort: boolean, next: A);
    map<B>(f: (a: A) => B): Redirect<B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * Unauthorized response.
 */
export declare class Unauthorized<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Unauthorized<B, AA>;
}
/**
 * Show action.
 */
export declare class Show<A, C> extends Api<A> {
    view: string;
    context: Maybe<C>;
    status: status.Status;
    abort: boolean;
    next: A;
    constructor(view: string, context: Maybe<C>, status: status.Status, abort: boolean, next: A);
    map<B>(f: (a: A) => B): Show<B, C>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * header queues up on or more headers to send to the client.
 */
export declare const header: (list: Headers) => Action<undefined>;
/**
 * show triggers the view engine to display the content of the view referenced
 * by the parameter "view".
 *
 * @param view        - The template to generate content from.
 * @param context     - The context used when generating the view.
 * @param status      - The HTTP status to send with the response.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export declare const show: <C>(view: string, context?: C | undefined, status?: number, abort?: boolean) => Action<undefined>;
/**
 * accepted sends the "ACCEPTED" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export declare const accepted: <A>(body?: A | undefined, abort?: boolean) => Action<undefined>;
/**
 * badRequest sends the "BAD REQUEST" status to the client with optional body.
 *
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export declare const badRequest: <A>(body?: A | undefined, abort?: boolean) => Action<undefined>;
/**
 * conflict sends the "CONFLICT" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export declare const conflict: <A>(body?: A | undefined, abort?: boolean) => Action<undefined>;
/**
 * created sends the "CREATED" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export declare const created: <A>(body?: A | undefined, abort?: boolean) => Action<undefined>;
/**
 * unauthorized sends the "UNAUTHORIZED" status to the client with optional body.
 *
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export declare const unauthorized: <A>(body?: A | undefined, abort?: boolean) => Action<undefined>;
/**
 * internalError sends the "INTERNAL SERVER ERROR" status and can optionally log
 * the error to console.
 *
 * @param err        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export declare const internalError: (body?: object | undefined, abort?: boolean) => Action<undefined>;
export { internalError as error };
/**
 * forbidden sends the "FORBIDDEN" status to the client with optional body.
 *
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export declare const forbidden: <A>(body?: A | undefined, abort?: boolean) => Action<undefined>;
/**
 * noContent sends the "NO CONTENT" status to the client.
 * @param abort      - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export declare const noContent: (abort?: boolean) => Action<undefined>;
/**
 * notFound sends the "NOT FOUND" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export declare const notFound: <A>(body?: A | undefined, abort?: boolean) => Action<undefined>;
/**
 * ok sends the "OK" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export declare const ok: <A>(body?: A | undefined, abort?: boolean) => Action<undefined>;
/**
 * redirect the client to a new resource.
 *
 * @param url         - The URL to redirect to.
 * @param code        - The HTTP status code to redirect with.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export declare const redirect: (url: string, code: number, abort?: boolean) => Action<undefined>;
