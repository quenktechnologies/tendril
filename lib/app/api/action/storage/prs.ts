/**
 * The Per Request Storage module (PRS) provides an API for storing small 
 * amounts of data that exist only for the duration of a request.
 *
 * This APIs primary purpose is to provide a way for filters to share data
 * with each other, without modifying the Request object.
 */

/** imports */
import * as path from '@quenk/noni/lib/data/record/path';

import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { compose, identity } from '@quenk/noni/lib/data/function';
import { Value } from '@quenk/noni/lib/data/jsonx';
import { Type } from '@quenk/noni/lib/data/type';
import { Maybe } from '@quenk/noni/lib/data/maybe';

import { Context } from '../../context';
import { ActionM, Action } from '../';

/**
 * Get
 * @private
 */
export class Get<A> extends Action<A> {

    constructor(public key: path.Path,
        public next: (v: Type) => A) { super(next); }

    map<B>(f: (n: A) => B): Get<B> {

        return new Get(this.key, compose(this.next, f));

    }

    exec(ctx: Context<A>): Future<A> {

        return pure(this.next(path.get(this.key, ctx.prs)));

    }

}

/**
 * Set
 * @private
 */
export class Set<A> extends Action<A> {

    constructor(
        public key: path.Path,
        public value: Value,
        public next: A) { super(next); }

    map<B>(f: (n: A) => B): Set<B> {

        return new Set(this.key, this.value, f(this.next));

    }

    exec(ctx: Context<A>): Future<A> {

        ctx.prs = path.set(this.key, this.value, ctx.prs);
        return pure(this.next);

    }

}

/**
 * Remove
 * @private
 */
export class Remove<A> extends Action<A> {

    constructor(
        public key: path.Path,
        public next: A) { super(next); }

    map<B>(f: (n: A) => B): Remove<B> {

        return new Remove(this.key, f(this.next));

    }

    exec(ctx: Context<A>): Future<A> {

        let prs = path.flatten(ctx.prs);

        delete prs[this.key];

        ctx.prs = path.unflatten(prs);

        return pure(this.next);

    }

}

/**
 * Exists
 * @private
 */
export class Exists<A> extends Action<A> {

    constructor(public key: path.Path,
        public next: (v: Type) => A) { super(next); }

    map<B>(f: (n: A) => B): Exists<B> {

        return new Exists(this.key, compose(this.next, f));

    }

    exec(ctx: Context<A>): Future<A> {

        return pure(this.next(path.get(this.key, ctx.prs).isJust()));

    }

}

/**
 * get a value from PRS.
 *
 * The value is is wrapped in a Maybe to promote safe access.
 */
export const get = (key: path.Path): ActionM<Maybe<Value>> =>
    liftF(new Get(key, identity));

/**
 * set will store a value in the PRS that can be later
 * read by filters or handlers that follow.
 *
 * When setting values it is recommended to use to namespace keys to avoid
 * collisions. For example:
 *
 * set('resource.search.query', {name: 'foo'});
 */
export const set = (key: path.Path, value: Value): ActionM<undefined> =>
    liftF(new Set(key, value, undefined));

/**
 * remove a value from PRS.
 */
export const remove = (key: path.Path): ActionM<undefined> =>
    liftF(new Remove(key, undefined));

/**
 * exists checks whether a value exists in PRS or not.
 */
export const exists = (key: path.Path): ActionM<boolean> =>
    liftF(new Exists(key, identity));
