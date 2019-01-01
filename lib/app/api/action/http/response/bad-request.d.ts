import { Response } from './';
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
export declare const badRequest: <A>(body?: A | undefined) => import("@quenk/noni/lib/control/monad/free").Free<import("../..").Action<any>, undefined>;
