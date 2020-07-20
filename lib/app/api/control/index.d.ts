import { Future } from '@quenk/noni/lib/control/monad/future';
import { Type } from '@quenk/noni/lib/data/type';
import { Request } from '../request';
import { Action, Api, Context } from '../';
/**
 * Forkable is an argument valid for the fork function.
 */
export declare type Forkable<A> = () => Future<A> | Future<A>;
/**
 * Value
 * @private
 */
export declare class Value<A> extends Api<A> {
    value: Type;
    next: (a: Type) => A;
    constructor(value: Type, next: (a: Type) => A);
    map<B>(f: (a: A) => B): Value<B>;
    exec(_: Context<A>): Future<A>;
}
/**
 * Fork
 * @private
 */
export declare class Fork<A> extends Api<A> {
    f: Forkable<Type>;
    next: (a: Type) => A;
    constructor(f: Forkable<Type>, next: (a: Type) => A);
    map<B>(f: (a: A) => B): Fork<B>;
    exec(_: Context<A>): Future<A>;
}
/**
 * Next
 * @private
 */
export declare class Next<A> extends Api<A> {
    request: Request;
    next: A;
    constructor(request: Request, next: A);
    map<B>(f: (n: A) => B): Next<B>;
    exec(ctx: Context<A>): Future<Action<A>>;
}
/**
 * next gives the go ahead to interpret the
 * actions of the next Filter chain.
 *
 * This action allows the Request in the context to be modified and
 * short-circuits the current chain.
 */
export declare const next: (r: Request) => Action<undefined>;
/**
 * value wraps a value so that it is available to the next value in the
 * chain.
 */
export declare const value: <A>(value: A) => Action<A>;
/**
 * fork suspends execution for a Future to execute and provide a value.
 */
export declare const fork: <A>(f: Forkable<A>) => Action<A>;
