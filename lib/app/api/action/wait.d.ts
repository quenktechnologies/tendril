import { Future } from '@quenk/noni/lib/control/monad/future';
import { Context } from '../context';
import { Action, ActionM } from './';
/**
 * Wait action.
 */
export declare class Wait<N, A> extends Action<A> {
    f: Future<ActionM<N>>;
    next: A;
    constructor(f: Future<ActionM<N>>, next: A);
    map<B>(f: (a: A) => B): Wait<N, B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * wait on an asynchrounous operation to acquire the next
 * action to carry out.
 */
export declare const wait: (f: Future<import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>>) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
