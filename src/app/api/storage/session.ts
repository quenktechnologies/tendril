/**
 * The session storage module provides apis for storing session data.
 *
 * "app.session.enable" must be set to true in order for these apis to work,
 * they fail silently otherwise.
 */

/** imports */

import * as path from '@quenk/noni/lib/data/record/path';

import { Future, pure, fromCallback } from '@quenk/noni/lib/control/monad/future';
import { compose, identity } from '@quenk/noni/lib/data/function';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Object, Value } from '@quenk/noni/lib/data/jsonx';
import { Type } from '@quenk/noni/lib/data/type';
import { Maybe, fromNullable } from '@quenk/noni/lib/data/maybe';

import { Action, Api, Context } from '../';

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

        let session: Object = ctx.request.session || {};

        return pure(this.next(fromNullable(session[this.key])));

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

        let session: Object = ctx.request.session || {};

        session[this.key] = this.value;

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

        let session: Object = ctx.request.session || {};

        delete session[this.key];

        return pure(this.next);

    }

}

/**
 * Exists
 * @private
 */
export class Exists<A> extends Api<A> {

    constructor(public key: path.Path,
        public next: (v: Type) => A) { super(next); }

    map<B>(f: (n: A) => B): Exists<B> {

        return new Exists(this.key, compose(this.next, f));

    }

    exec(ctx: Context<A>): Future<A> {

        let session: Object = ctx.request.session || {};

        return pure(this.next(fromNullable(session[this.key]).isJust()));

    }

}

/**
 * Regenerate
 * @private
 */
export class Regenerate<A> extends Api<A> {

    constructor(public next: A) { super(next); }


    map<B>(f: (n: A) => B): Regenerate<B> {

        return new Regenerate(f(this.next));

    }

    exec({ request }: Context<A>): Future<A> {

        if (request.session != null) {

            let session = request.session;

            return fromCallback(cb => session.regenerate(cb))
                .chain(() => pure(this.next));

        }

        return pure(this.next);

    }

}

/**
 * Destroy
 * @private
 */
export class Destroy<A> extends Api<A> {

    constructor(public next: A) { super(next); }


    map<B>(f: (n: A) => B): Destroy<B> {

        return new Destroy(f(this.next));

    }

    exec({ request }: Context<A>): Future<A> {

        if (request.session != null) {

            let session = request.session;

            return fromCallback(cb => session.destroy(cb))
                .chain(() => pure(this.next));

        }

        return pure(this.next);

    }

}

/**
 * Save
 * @private
 */
export class Save<A> extends Api<A> {

    constructor(public next: A) { super(next); }


    map<B>(f: (n: A) => B): Save<B> {

        return new Save(f(this.next));

    }

    exec({ request }: Context<A>): Future<A> {

        if (request.session != null) {

            let session = request.session;

            return fromCallback(cb => session.save(cb))
                .chain(() => pure(this.next));

        }

        return pure(this.next);

    }

}

/**
 * get a value from session by key.
 *
 * The value is is wrapped in a Maybe to promote safe access.
 */
export const get = (key: path.Path): Action<Maybe<Value>> =>
    liftF(new Get(key, identity));

/**
 * set a value for a key in the session.
 */
export const set = (key: path.Path, value: Value): Action<undefined> =>
    liftF(new Set(key, value, undefined));

/**
 * remove a value from the session.
 */
export const remove = (key: path.Path): Action<undefined> =>
    liftF(new Remove(key, undefined));

/**
 * exists checks whether a value exists in the session.
 */
export const exists = (key: path.Path): Action<boolean> =>
    liftF(new Exists(key, identity));

/**
 * regenerate causes the session to be regenerated and a new SID set.
 */
export const regenerate = (): Action<undefined> =>
    liftF(new Regenerate(undefined));

/**
 * destroy the session.
 */
export const destroy = (): Action<undefined> =>
    liftF(new Destroy(undefined));

/**
 * Save session data.
 *
 * This causes session data to be stored immediately instead of at the end
 * of the request.
 */
export const save = (): Action<undefined> =>
    liftF(new Save(undefined));