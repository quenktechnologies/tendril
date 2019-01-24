import { Future } from '@quenk/noni/lib/control/monad/future';
import { Context } from '../context';
import { Action } from './';
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
export declare const await: <A>(f: () => Future<A>) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, A>;
