import {  liftF } from '@quenk/noni/lib/control/monad/free';
import { Future, pure  } from '@quenk/noni/lib/control/monad/future';
import {  compose, identity } from '@quenk/noni/lib/data/function';
import { Address } from '@quenk/potoo/lib/actor/address';
import { Context } from '../context';
import { Action, ActionM } from './';

/**
 * Self instruction.
 */
export class Self<N, A> extends Action<A> {

    constructor(public next: (a: any) => A) { super(next); }

    map<B>(f: (a: A) => B): Self<N, B> {

        return new Self(compose(this.next, f));

    }

    exec(ctx: Context<A>): Future<A> {

        return pure(this.next(ctx.module.self()));

    }

}

/**
 * self provides the address of the module.
 */
export const self = (): ActionM<Address> =>
    liftF(new Self(identity));
