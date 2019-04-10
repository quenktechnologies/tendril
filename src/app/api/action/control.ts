import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { compose, identity } from '@quenk/noni/lib/data/function';
import { Context } from '../context';
import { ActionM, Action } from './';

/**
 * Value action.
 */
export class Value<A> extends Action<A> {

    constructor(public value: any, public next: (a: any) => A) { super(next); }

    map<B>(f: (a: A) => B): Value<B> {

        return new Value(this.value, compose(this.next, f));

    }

    exec(_: Context<A>): Future<A> {

        return pure(this.next(this.value));

    }

}

/**
 * value wraps a value so that it is available to the next value in the 
 * chain.
 */
export const value = <A>(value: A): ActionM<A> =>
    liftF(new Value(value, identity));
