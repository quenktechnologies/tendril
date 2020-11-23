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
import { Value, Object } from '@quenk/noni/lib/data/jsonx';
import { Type } from '@quenk/noni/lib/data/type';
import { Maybe } from '@quenk/noni/lib/data/maybe';

import { Action, Api, Context } from '../';
import { Storage } from './';

/**
 * Get
 * @private
 */
export class Get<A> extends Api<A> {

    constructor(public key: path.Path,
        public next: (v: Type) => A) { super(next); }

    map<B>(f: (n: A) => B): Get<B> {

        return new Get(this.key, compose(this.next, f));

    }

    exec(ctx: Context<A>): Future<A> {

        return pure(this.next(ctx.request.prs.get(this.key)));

    }

}

/**
 * GetOrElse
 * @private
 */
export class GetOrElse<A> extends Api<A> {

    constructor(
        public key: path.Path,
        public value: Value,
        public next: (v: Type) => A) { super(next); }

    map<B>(f: (n: A) => B): GetOrElse<B> {

        return new GetOrElse(this.key, this.value, compose(this.next, f));

    }

    exec(ctx: Context<A>): Future<A> {

        return pure(this.next(ctx.request.prs.getOrElse(
          this.key, 
          this.value
            )));

    }

}

/**
 * Set
 * @private
 */
export class Set<A> extends Api<A> {

    constructor(
        public key: path.Path,
        public value: Value,
        public next: A) { super(next); }

    map<B>(f: (n: A) => B): Set<B> {

        return new Set(this.key, this.value, f(this.next));

    }

    exec(ctx: Context<A>): Future<A> {

        ctx.request.prs.set(this.key, this.value);
        return pure(this.next);

    }

}

/**
 * Remove
 * @private
 */
export class Remove<A> extends Api<A> {

    constructor(
        public key: path.Path,
        public next: A) { super(next); }

    map<B>(f: (n: A) => B): Remove<B> {

        return new Remove(this.key, f(this.next));

    }

    exec(ctx: Context<A>): Future<A> {

        ctx.request.prs.remove(this.key);
        return pure(this.next);

    }

}

/**
 * Exists
 * @private
 */
export class Exists<A> extends Api<A> {

    constructor(
        public key: path.Path,
        public next: (v: Type) => A) { super(next); }

    map<B>(f: (n: A) => B): Exists<B> {

        return new Exists(this.key, compose(this.next, f));

    }

    exec(ctx: Context<A>): Future<A> {

        return pure(this.next(ctx.request.prs.exists(this.key)));

    }

}

/**
 * PRSStorage class.
 *
 * This is used behind the scens to provide the prs api.
 */
export class PRSStorage implements Storage {

    constructor(public data: Object = {}) { }

    get(key: string): Maybe<Value> {

        return path.get(key, this.data);
    }

    getOrElse(key: string, alt: Value): Value {

        return path.getDefault(key, this.data, alt);

    }

    exists(key: string): boolean {

        return path.get(key, this.data).isJust();

    }

    set(key: string, value: Value): PRSStorage {

        this.data = path.set(key, value, this.data);
        return this;

    }

    remove(key: string): PRSStorage {

        let prs = path.flatten(this.data);

        delete prs[key];

        this.data = path.unflatten(prs);

        return this;

    }

    reset(): PRSStorage {

        this.data = {};
        return this;

    }

}

/**
 * get a value from PRS.
 *
 * The value is is wrapped in a Maybe to promote safe access.
 */
export const get = (key: path.Path): Action<Maybe<Value>> =>
    liftF(new Get(key, identity));

/**
 * getOrElse provides a value from PRS or an alternative if it is == null.
 */
export const getOrElse = (key: path.Path, value: Value): Action<string> =>
    liftF(new GetOrElse(key, value, identity));

/**
 * set will store a value in the PRS that can be later
 * read by filters or handlers that follow.
 *
 * When setting values it is recommended to use to namespace keys to avoid
 * collisions. For example:
 *
 * set('resource.search.query', {name: 'foo'});
 */
export const set = (key: path.Path, value: Value): Action<undefined> =>
    liftF(new Set(key, value, undefined));

/**
 * remove a value from PRS.
 */
export const remove = (key: path.Path): Action<undefined> =>
    liftF(new Remove(key, undefined));

/**
 * exists checks whether a value exists in PRS or not.
 */
export const exists = (key: path.Path): Action<boolean> =>
    liftF(new Exists(key, identity));
