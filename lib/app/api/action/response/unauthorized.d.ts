import { Response } from './';
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
export declare const unauthorized: <A>(body?: A | undefined) => import("@quenk/noni/lib/control/monad/free").Free<import("..").Action<any>, undefined>;
