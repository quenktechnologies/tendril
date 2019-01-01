import { Future } from '@quenk/noni/lib/control/monad/future';
import {liftF} from '@quenk/noni/lib/control/monad/free';
import { Context } from '../context';
import { Request } from '../request';
import { ActionM, Action } from './';

/**
 * Next action.
 */
export class Next<A> extends Action<A> {

    constructor(public request: Request, public next: A) { super(next); }

    map<B>(f: (n: A) => B): Next<B> {

        return new Next(this.request, f(this.next));

    }

    exec(ctx: Context<A>): Future<ActionM<A>> {

        ctx.request = this.request;
        return ctx.next();

    }

}

/**
 * next gives the go ahead to interpret the 
 * actions of the next Filter chain.
 *
 * This action allows the Request in the context to be modified and
 * short-circuits the current chain.
 */
export const next = (r: Request): ActionM<undefined> => liftF(new Next(r, undefined));

