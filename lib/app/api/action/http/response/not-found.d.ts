import { Response } from './';
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
export declare const notFound: <A>(body?: A | undefined) => import("@quenk/noni/lib/control/monad/free").Free<import("../..").Action<any>, undefined>;
