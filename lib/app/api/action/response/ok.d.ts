import { Response } from './';
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
export declare const ok: <A>(body?: A | undefined) => import("@quenk/noni/lib/control/monad/free").Free<import("..").Action<any>, undefined>;
