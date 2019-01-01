import { Future } from '@quenk/noni/lib/control/monad/future';
import { Action } from '../..';
import { Context } from '../../../context';
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
