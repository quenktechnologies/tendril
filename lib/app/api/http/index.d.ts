/**
 * The http module provides the part of the api for sending http requests.
 */
/** imports */
import * as status from './status';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Err } from '@quenk/noni/lib/control/error';
import { Action, Context } from '../';
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
 * Ok action.
 */
export declare class Ok<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Ok<B, AA>;
}
/**
 * Accepted response.
 */
export declare class Accepted<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Accepted<B, AA>;
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
 * Created response.
 */
export declare class Created<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Created<B, AA>;
}
/**
 * BadRequest response.
 */
export declare class BadRequest<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): BadRequest<B, AA>;
}
/**
 * Unauthorized response.
 */
export declare class Unauthorized<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Unauthorized<B, AA>;
}
/**
 * Forbiddden response.
 */
export declare class Forbidden<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Forbidden<B, AA>;
}
/**
 * NotFound response.
 */
export declare class NotFound<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): NotFound<B, AA>;
}
/**
 * Conflict response.
 */
export declare class Conflict<B, A> extends Response<B, A> {
    status: number;
    map<AA>(f: (a: A) => AA): Conflict<B, AA>;
}
/**
 * InternalServerError response.
 */
export declare class InternalServerError<A> extends Response<Err, A> {
    body: Maybe<Err>;
    next: A;
    constructor(body: Maybe<Err>, next: A);
    status: number;
    map<B>(f: (a: A) => B): InternalServerError<B>;
    exec({ response }: Context<A>): Future<A>;
}
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
export declare const redirect: (url: string, code: number) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
/**
 * ok sends the "OK" status to the client with optional body.
 */
export declare const ok: <A>(body?: A | undefined) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
/**
 * accepted sends the "ACCEPTED" status to the client with optional body.
 */
export declare const accepted: <A>(body: A) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
/**
 * noContent sends the "NO CONTENT" status to the client.
 */
export declare const noContent: () => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
/**
 * created sends the "CREATED" status to the client with optional body.
 */
export declare const created: <A>(body?: A | undefined) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
/**
 * badRequest sends the "BAD REQUEST" status to the client with optional body.
 */
export declare const badRequest: <A>(body?: A | undefined) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
/**
 * unauthorized sends the "UNAUTHORIZED" status to the client with optional body.
 */
export declare const unauthorized: <A>(body?: A | undefined) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
/**
 * forbidden sends the "FORBIDDEN" status to the client with optional body.
 */
export declare const forbidden: <A>(body?: A | undefined) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
/**
 * notFound sends the "NOT FOUND" status to the client with optional body.
 */
export declare const notFound: <A>(body?: A | undefined) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
/**
 * conflict sends the "CONFLICT" status to the client with optional body.
 */
export declare const conflict: <A>(body?: A | undefined) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
/**
 * error sends the "INTERNAL SERVER ERROR" status and can optionally log
 * the error to console.
 */
export declare const error: (err?: Err | undefined) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
