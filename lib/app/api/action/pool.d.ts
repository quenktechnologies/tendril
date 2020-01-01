/**
 * Here you will find api functions for interacting with the application's
 * connection pool.
 */
/** imports */
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Context } from '../context';
import { Action, ActionM } from './';
/**
 * Checkout action.
 */
export declare class Checkout<A> extends Action<A> {
    name: string;
    next: (x: any) => A;
    constructor(name: string, next: (x: any) => A);
    map<B>(f: (n: A) => B): Checkout<B>;
    exec({ module }: Context<A>): Future<A>;
}
/**
 * checkout a Connection from the application's pool.
 */
export declare const checkout: <A>(name: string) => ActionM<A>;
