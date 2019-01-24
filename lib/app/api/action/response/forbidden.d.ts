import { Response } from './';
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
export declare const forbidden: <A>(body?: A | undefined) => import("@quenk/noni/lib/control/monad/free").Free<import("..").Action<any>, undefined>;
