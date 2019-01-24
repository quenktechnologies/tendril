import { Response } from './';
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
export declare const noContent: () => import("@quenk/noni/lib/control/monad/free").Free<import("..").Action<any>, undefined>;
