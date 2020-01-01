import { Future } from '@quenk/noni/lib/control/monad/future';
import { Context } from '../../context';
import { Request } from '../../request';
import { ActionM, Action } from '../';
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
export declare const value: <A>(value: A) => ActionM<A>;
/**
 * Await action.
 */
export declare class Await<A> extends Action<A> {
    f: () => Future<any>;
    next: (a: any) => A;
    constructor(f: () => Future<any>, next: (a: any) => A);
    map<B>(f: (a: A) => B): Await<B>;
    exec(_: Context<A>): Future<A>;
}
/**
 * await a value from an asynchrounous operation before continuing.
 */
export declare const await: <A>(f: () => Future<A>) => ActionM<A>;
/**
 * Next action.
 */
export declare class Next<A> extends Action<A> {
    request: Request;
    next: A;
    constructor(request: Request, next: A);
    map<B>(f: (n: A) => B): Next<B>;
    exec(ctx: Context<A>): Future<ActionM<A>>;
}
/**
 * next gives the go ahead to interpret the
 * actions of the next Filter chain.
 *
 * This action allows the Request in the context to be modified and
 * short-circuits the current chain.
 */
export declare const next: (r: Request) => ActionM<undefined>;
