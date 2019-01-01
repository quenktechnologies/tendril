import { Response } from './';
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
export declare const accepted: <A>(body: A) => import("@quenk/noni/lib/control/monad/free").Free<import("../..").Action<any>, undefined>;
