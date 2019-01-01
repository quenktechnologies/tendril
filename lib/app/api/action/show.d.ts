import { Future } from '@quenk/noni/lib/control/monad/future';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Context } from '../context';
import { Action } from './';
/**
 * Show action.
 */
export declare class Show<A, C> extends Action<A> {
    view: string;
    context: Maybe<C>;
    next: A;
    constructor(view: string, context: Maybe<C>, next: A);
    map<B>(f: (a: A) => B): Show<B, C>;
    exec({ response, module }: Context<A>): Future<A>;
}
/**
 * show the client some content.
 */
export declare const show: <C>(view: string, context?: C | undefined) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
