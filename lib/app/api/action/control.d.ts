import { Future } from '@quenk/noni/lib/control/monad/future';
import { Context } from '../context';
import { Action } from './';
/**
 * Value action.
 */
export declare class Value<A> extends Action<A> {
    value: any;
    next: (a: any) => A;
    constructor(value: any, next: (a: any) => A);
    map<B>(f: (a: A) => B): Value<B>;
    exec(_: Context<A>): Future<A>;
}
/**
 * value wraps a value so that it is available to the next value in the
 * chain.
 */
export declare const value: <A>(value: A) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, A>;
