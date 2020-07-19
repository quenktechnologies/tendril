import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { compose, identity } from '@quenk/noni/lib/data/function';
import { Context } from '../../context';
import {Request} from '../../request';
import { Action, Api } from '../';

/**
 * Value action.
 */
export class Value<A> extends Api<A> {

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
export const value = <A>(value: A): Action<A> =>
    liftF(new Value(value, identity));


/**
 * Await action.
 */
export class Await<A> extends Api<A>{

    constructor(
        public f: () => Future<any>,
        public next: (a: any) => A) { super(next); }

    map<B>(f: (a: A) => B): Await<B> {

        return new Await(this.f, compose(this.next, f));

    }

    exec(_: Context<A>): Future<A> {

        return this.f().map(this.next);

    }

}

/**
 * await a value from an asynchrounous operation before continuing.
 */
export const await = <A>(f: () => Future<A>): Action<A> =>
    liftF(new Await(f, identity));

/**
 * Next action.
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
export const next = (r: Request): Action<undefined> => liftF(new Next(r, undefined));

