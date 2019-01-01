import { Future } from '@quenk/noni/lib/control/monad/future';
import { Context } from '../context';
import { Request } from '../request';
import { ActionM, Action } from './';
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
export declare const next: (r: Request) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
