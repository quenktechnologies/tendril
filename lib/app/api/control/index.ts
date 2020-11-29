import { liftF, pure as freePure } from '@quenk/noni/lib/control/monad/free';
import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { compose, identity } from '@quenk/noni/lib/data/function';
import { Type } from '@quenk/noni/lib/data/type';

import { Request } from '../request';
import { Action, Api, Context } from '../';

/**
 * Value
 * @private
 */
export class Value<A> extends Api<A> {

    constructor(
        public value: Type,
        public next: (a: Type) => A) { super(next); }

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
        public f: Future<Type>,
        public next: (a: Type) => A) { super(next); }

    map<B>(f: (a: A) => B): Fork<B> {

        return new Fork(this.f, compose(this.next, f));

    }

    exec(_: Context<A>): Future<A> {

        let { f, next } = this;

        return f.map(next);

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
 * Noop
 * @private
 */
export class Noop<A> extends Api<A> {

    constructor(public next: A) { super(next); }

    map<B>(f: (n: A) => B): Noop<B> {

        return new Noop(f(this.next));

    }

    exec(_: Context<A>): Future<A> {

        return pure(this.next);

    }

}

/**
 * Abort
 * @private
 */
export class Abort<A> extends Api<A> {

    constructor(public next: A) { super(next); }

    map<B>(f: (n: A) => B): Abort<B> {

        return new Abort(f(this.next));

    }

    exec(c: Context<A>): Future<Action<A>> {

        c.filters = [];
        return pure(freePure(<Type>undefined));

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
 * noop (does nothing).
 */
export const noop = (): Action<void> =>
    liftF(new Noop(undefined));

/**
 * value wraps a value so that it is available to the next value in the 
 * chain.
 */
export const value = <A>(value: A): Action<A> =>
    liftF(new Value(value, identity));

/**
 * fork suspends execution for a Future to execute and provide a value.
 */
export const fork = <A>(f: Future<A>): Action<A> =>
    liftF(new Fork(f, identity));

/**
 * abort ends the processing of the current filter chain.
 *
 * This halts the Context's chain and any chain it is directly part of.
 * Note: If this API is used, then a response should be sent to the client 
 * first to avoid the browser waiting for a response.
 */
export const abort = (): Action<undefined> =>
    liftF(new Abort(undefined));
