import { Response } from './';
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
export declare const conflict: <A>(body?: A | undefined) => import("@quenk/noni/lib/control/monad/free").Free<import("..").Action<any>, undefined>;
