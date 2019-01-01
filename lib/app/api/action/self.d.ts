import { Future } from '@quenk/noni/lib/control/monad/future';
import { Context } from '../context';
import { Action } from './';
/**
 * Self instruction.
 */
export declare class Self<N, A> extends Action<A> {
    next: (a: any) => A;
    constructor(next: (a: any) => A);
    map<B>(f: (a: A) => B): Self<N, B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * self provides the address of the module.
 */
export declare const self: () => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, string>;
