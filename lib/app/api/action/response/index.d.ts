/**
 * This module provides functions for sending http responses.
 */
/** imports */
import * as status from './status';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Err } from '@quenk/noni/lib/control/error';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Context } from '../../context';
import { Action, ActionM } from '../';
/**
 * Headers map.
 */
export interface Headers {
    [key: string]: string;
}
/**
 * Response terminates the http request with an actual HTTP response.
 */
export declare abstract class Response<B, A> extends Action<A> {
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
export declare class Header<A> extends Action<A> {
    headers: Headers;
    next: A;
    constructor(headers: Headers, next: A);
    map<B>(f: (a: A) => B): Header<B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * header queues up on or more headers to send to the client.
 */
export declare const header: (list: Headers) => ActionM<undefined>;
/**
 * Accepted response.
 */
export declare class Accepted<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Accepted<B, AA>;
}
/**
 * accepted sends the "ACCEPTED" status to the client with optional body.
 */
export declare const accepted: <A>(body: A) => ActionM<undefined>;
/**
 * BadRequest response.
 */
export declare class BadRequest<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): BadRequest<B, AA>;
}
/**
 * badRequest sends the "BAD REQUEST" status to the client with optional body.
 */
export declare const badRequest: <A>(body?: A | undefined) => ActionM<undefined>;
/**
 * Conflict response.
 */
export declare class Conflict<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Conflict<B, AA>;
}
/**
 * conflict sends the "CONFLICT" status to the client with optional body.
 */
export declare const conflict: <A>(body?: A | undefined) => ActionM<undefined>;
/**
 * Created response.
 */
export declare class Created<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Created<B, AA>;
}
/**
 * created sends the "CREATED" status to the client with optional body.
 */
export declare const created: <A>(body?: A | undefined) => ActionM<undefined>;
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
 * error sends the "INTERNAL SERVER ERROR" status and can optionally log
 * the error to console.
 */
export declare const error: (err?: Err | undefined) => ActionM<undefined>;
/**
 * Forbiddden response.
 */
export declare class Forbidden<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Forbidden<B, AA>;
}
/**
 * forbidden sends the "FORBIDDEN" status to the client with optional body.
 */
export declare const forbidden: <A>(body?: A | undefined) => ActionM<undefined>;
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
 * noContent sends the "NO CONTENT" status to the client.
 */
export declare const noContent: () => ActionM<undefined>;
/**
 * NotFound response.
 */
export declare class NotFound<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): NotFound<B, AA>;
}
/**
 * notFound sends the "NOT FOUND" status to the client with optional body.
 */
export declare const notFound: <A>(body?: A | undefined) => ActionM<undefined>;
/**
 * Ok action.
 */
export declare class Ok<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Ok<B, AA>;
}
/**
 * ok sends the "OK" status to the client with optional body.
 */
export declare const ok: <A>(body?: A | undefined) => ActionM<undefined>;
/**
 * Redirect action.
 */
export declare class Redirect<A> extends Action<A> {
    url: string;
    code: number;
    next: A;
    constructor(url: string, code: number, next: A);
    map<B>(f: (a: A) => B): Redirect<B>;
    exec({ response }: Context<A>): Future<A>;
}
/**
 * redirect the client to a new resource.
 */
export declare const redirect: (url: string, code: number) => ActionM<undefined>;
/**
 * Unauthorized response.
 */
export declare class Unauthorized<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Unauthorized<B, AA>;
}
/**
 * unauthorized sends the "UNAUTHORIZED" status to the client with optional body.
 */
export declare const unauthorized: <A>(body?: A | undefined) => ActionM<undefined>;
/**
 * Show action.
 */
export declare class Show<A, C> extends Action<A> {
    view: string;
    context: Maybe<C>;
    status: status.Status;
    next: A;
    constructor(view: string, context: Maybe<C>, status: status.Status, next: A);
    map<B>(f: (a: A) => B): Show<B, C>;
    exec({ response, module }: Context<A>): Future<A>;
}
/**
 * show the client some content.
 */
export declare const show: <C>(view: string, context?: C | undefined, status?: number) => ActionM<undefined>;
