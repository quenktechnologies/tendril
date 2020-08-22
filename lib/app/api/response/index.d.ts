/**
 * This module provides functions for sending http responses.
 */
import * as status from './status';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Err } from '@quenk/noni/lib/control/error';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Api, Action, Context } from '../';
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
    next: A;
    constructor(body: Maybe<B>, next: A);
    abstract status: status.Status;
    abstract map<AA>(f: (a: A) => AA): Response<B, AA>;
    exec({ response }: Context<A>): Future<A>;
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
export declare class InternalServerError<A> extends Response<Err, A> {
    error: Maybe<Err>;
    next: A;
    constructor(error: Maybe<Err>, next: A);
    status: number;
    map<B>(f: (a: A) => B): InternalServerError<B>;
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
    next: A;
    constructor(next: A);
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
    next: A;
    constructor(url: string, code: number, next: A);
    map<B>(f: (a: A) => B): Redirect<B>;
    exec({ response }: Context<A>): Future<A>;
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
    next: A;
    constructor(view: string, context: Maybe<C>, status: status.Status, next: A);
    map<B>(f: (a: A) => B): Show<B, C>;
    exec({ response, module, prs }: Context<A>): Future<A>;
}
/**
 * header queues up on or more headers to send to the client.
 */
export declare const header: (list: Headers) => Action<undefined>;
/**
 * show the client some content.
 */
export declare const show: <C>(view: string, context?: C | undefined, status?: number) => Action<undefined>;
/**
 * accepted sends the "ACCEPTED" status to the client with optional body.
 */
export declare const accepted: <A>(body: A) => Action<undefined>;
/**
 * badRequest sends the "BAD REQUEST" status to the client with optional body.
 */
export declare const badRequest: <A>(body?: A | undefined) => Action<undefined>;
/**
 * conflict sends the "CONFLICT" status to the client with optional body.
 */
export declare const conflict: <A>(body?: A | undefined) => Action<undefined>;
/**
 * created sends the "CREATED" status to the client with optional body.
 */
export declare const created: <A>(body?: A | undefined) => Action<undefined>;
/**
 * unauthorized sends the "UNAUTHORIZED" status to the client with optional body.
 */
export declare const unauthorized: <A>(body?: A | undefined) => Action<undefined>;
/**
 * error sends the "INTERNAL SERVER ERROR" status and can optionally log
 * the error to console.
 */
export declare const error: (err?: Err | undefined) => Action<undefined>;
/**
 * forbidden sends the "FORBIDDEN" status to the client with optional body.
 */
export declare const forbidden: <A>(body?: A | undefined) => Action<undefined>;
/**
 * noContent sends the "NO CONTENT" status to the client.
 */
export declare const noContent: () => Action<undefined>;
/**
 * notFound sends the "NOT FOUND" status to the client with optional body.
 */
export declare const notFound: <A>(body?: A | undefined) => Action<undefined>;
/**
 * ok sends the "OK" status to the client with optional body.
 */
export declare const ok: <A>(body?: A | undefined) => Action<undefined>;
/**
 * redirect the client to a new resource.
 */
export declare const redirect: (url: string, code: number) => Action<undefined>;
