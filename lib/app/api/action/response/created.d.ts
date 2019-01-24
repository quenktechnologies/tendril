import { Response } from './';
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
export declare const created: <A>(body?: A | undefined) => import("@quenk/noni/lib/control/monad/free").Free<import("..").Action<any>, undefined>;
