import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { compose, identity } from '@quenk/noni/lib/data/function';
import { Type } from '@quenk/noni/lib/data/type';

import { Request } from '../request';
import { Action, Api, Context } from '../';

/**
 * Forkable is an argument valid for the fork function.
 */
export type Forkable<A> = () => Future<A> | Future<A>;

/**
 * Value
 * @private
 */
export class Value<A> extends Api<A> {

    constructor(public value: Type, public next: (a: Type) => A) { super(next); }

    map<B>(f: (a: A) => B): Value<B> {

        return new Value(this.value, compose(this.next, f));

    }

    exec(_: Context<A>): Future<A> {

        return pure(this.next(this.value));

    }

}

/**
 * Fork
 * @private
 */
export class Fork<A> extends Api<A>{

    constructor(
        public f: Forkable<Type>,
        public next: (a: Type) => A) { super(next); }

    map<B>(f: (a: A) => B): Fork<B> {

        return new Fork(this.f, compose(this.next, f));

    }

    exec(_: Context<A>): Future<A> {

        let { f, next } = this;
        let fut: Future<A> = (typeof f === 'function') ? f() : <Future<A>>f;

        return fut.map(next);

    }

}

/**
 * Next
 * @private
 */
export class Next<A> extends Api<A> {

    constructor(public request: Request, public next: A) { super(next); }

    map<B>(f: (n: A) => B): Next<B> {

        return new Next(this.request, f(this.next));

    }

    exec(ctx: Context<A>): Future<Action<A>> {

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
export const next = (r: Request): Action<undefined> =>
    liftF(new Next(r, undefined));

/**
 * value wraps a value so that it is available to the next value in the 
 * chain.
 */
export const value = <A>(value: A): Action<A> =>
    liftF(new Value(value, identity));

/**
 * fork suspends execution for a Future to execute and provide a value.
 */
export const fork = <A>(f: Forkable<A>): Action<A> =>
    liftF(new Fork(f, identity));
