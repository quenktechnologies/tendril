/**
 * The session storage module provides apis for storing session data.
 *
 * "app.session.enable" must be set to true in order for these apis to work,
 * they fail silently otherwise.
 */

/** imports */

import * as express from 'express';
import * as path from '@quenk/noni/lib/data/record/path';

import {
    Future,
    pure,
    fromCallback
} from '@quenk/noni/lib/control/monad/future';
import { compose, identity } from '@quenk/noni/lib/data/function';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Object, Value } from '@quenk/noni/lib/data/jsonx';
import { Type, isFunction, isObject } from '@quenk/noni/lib/data/type';
import { Maybe, nothing } from '@quenk/noni/lib/data/maybe';
import { clone, rcompact } from '@quenk/noni/lib/data/record';

import { Action, Api, Context } from '../';
import { Storage } from './';

export const SESSION_DATA = 'tendril.$data';
export const SESSION_DESCRIPTORS = 'tendril.$descriptors';

/**
 * Descriptor is the internal configuration of a session property.
 *
 * The settings specified here have an impact no the treatment of the session
 * property.
 */
export interface Descriptor {

    /**
     * ttl if set is the number of requests a session value should be retained
     * for. When this reaches zero the propety will be automatically removed.
     */
    ttl?: number

}

/**
 * SessionStorage acts as a bridge between the tendril applications and 
 * the underlying express session store API.
 */
export interface SessionStorage extends Storage {

    /**
     * isEnabled returns true if session storage is enabled, false otherwise.
     */
    isEnabled(): boolean

    /**
     * setWithDescriptor sets the value of a key in session storage along with 
     * a descriptor.
     */
    setWithDescriptor(
        key: string,
        value: Value,
        desc: Descriptor): SessionStorage

    /**
     * save the session data.
     *
     * Call this method to immediately persist any data written to the session.
     */
    save(): Future<void>

    /**
     * regenerate the session.
     *
     * This hooks into the lower level API to invalidate the current session id
     * supplied by the client and issue a new one. All data stored in the
     * session will be lost, including data not set through this API.
     */
    regenerate(): Future<void>

    /**
     * destroy the session.
     *
     * Everything comes to an end here.
     */
    destroy(): Future<void>

}

/**
 * Get
 * @private
 */
export class Get<A> extends Api<A> {

    constructor(
        public key: path.Path,
        public next: (v: Type) => A) { super(next); }

    map<B>(f: (n: A) => B): Get<B> {

        return new Get(this.key, compose(this.next, f));

    }

    exec(ctx: Context<A>): Future<A> {

        return pure(this.next(ctx.request.session.get(this.key)));

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

        return pure(this.next(
            ctx.request.session.getOrElse(this.key, this.value)
        ));

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
        public desc: Descriptor,
        public next: A) { super(next); }

    map<B>(f: (n: A) => B): Set<B> {

        return new Set(this.key, this.value, this.desc, f(this.next));

    }

    exec(ctx: Context<A>): Future<A> {

        ctx.request.session.setWithDescriptor(this.key, this.value, this.desc);
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

        ctx.request.session.remove(this.key);
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

        return pure(this.next(ctx.request.session.exists(this.key)));

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

    exec(ctx: Context<A>): Future<A> {

        return ctx
            .request
            .session
            .regenerate()
            .chain(() => pure(this.next));

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

    exec(ctx: Context<A>): Future<A> {

        return ctx
            .request
            .session
            .destroy()
            .chain(() => pure(this.next));

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

    exec(ctx: Context<A>): Future<A> {

        return ctx
            .request
            .session
            .save()
            .chain(() => pure(this.next));

    }

}

/**
 * @private
 */
export class DisabledSessionStorage implements SessionStorage {

    warn(method: string) {

        console.warn(
            `[DisabledSessionStorage#${method}]: session storage is not enabled!`
        );

    }

    isEnabled() {

        return false;

    }

    get(_key: string): Maybe<Value> {

        this.warn('get');
        return nothing();

    }

    getOrElse(_key: string, alt: Value): Value {

        this.warn('getOrElse');
        return alt;

    }

    getAll(): Object {

        this.warn('getAll');
        return {};

    }

    exists(_key: string): boolean {

        this.warn('exists');
        return false;

    }

    set(_key: string, _value: Value): DisabledSessionStorage {

        this.warn('set');
        return this;

    }

    setWithDescriptor(
        _key: string,
        _value: Value,
        _desc: Descriptor): DisabledSessionStorage {

        this.warn('setWithDescriptor');
        return this;

    }

    remove(_: string): DisabledSessionStorage {

        this.warn('remove');
        return this;

    }

    reset(): DisabledSessionStorage {

        this.warn('reset');
        return this;

    }

    save(): Future<void> {

        this.warn('save');
        return pure(<void>undefined);

    }

    regenerate(): Future<void> {

        this.warn('regenerate');
        return pure(<void>undefined);

    }

    destroy(): Future<void> {

        this.warn('destroy');
        return pure(<void>undefined);

    }

}

/**
 * EnabledSessionStorage class.
 */
export class EnabledSessionStorage implements SessionStorage {

    /**
     * @private
     */
    constructor(public data: Object) { }

    /**
     * fromExpress constructs a SessionStorage instance from an express
     * Request.
     *
     * If session support is not enabled, a DisabledSessionStorage will be
     * provided instead.
     */
    static fromExpress(r: express.Request): SessionStorage {

        return isObject(r.session) ?
            new EnabledSessionStorage(<Object><object>r.session) :
            new DisabledSessionStorage();

    }

    /**
     * @private
     */
    target(): Object {

        return <Object>(this.data && this.data[SESSION_DATA] || {});

    }

    /**
     * @private
     */
    descriptors(): Object {

        return <Object>(this.data && this.data[SESSION_DESCRIPTORS] || {});

    }

    isEnabled(): boolean {

        return isObject(this.data);

    }

    get(key: string): Maybe<Value> {

        return path.get(key, this.target());

    }

    getOrElse(key: string, alt: Value): Value {

        return path.getDefault(key, this.target(), alt);

    }

    getAll() : Object {

      return clone(this.target());

    }

    exists(key: string): boolean {

        return path.get(key, this.target()).isJust();

    }

    set(key: string, value: Value): EnabledSessionStorage {

        return this.setWithDescriptor(key, value, {});

    }

    setWithDescriptor(
        key: string,
        value: Value,
        desc: Descriptor): EnabledSessionStorage {

        let target = this.target();
        let descs = this.descriptors();

        this.data[SESSION_DATA] = path.set(key, value, target);

        descs[key] = <Object>desc;

        this.data[SESSION_DESCRIPTORS] = <Object>descs;

        return this;

    }

    remove(key: string): EnabledSessionStorage {

        let target = this.target();
        let descs = this.descriptors();

        this.data[SESSION_DATA] =
            rcompact(path.set(key, <Value>undefined, target));

        delete descs[key];
        this.data[SESSION_DESCRIPTORS] = descs;

        return this;

    }

    reset(): EnabledSessionStorage {

        this.data[SESSION_DATA] = {};
        return this;

    }

    save(): Future<void> {

        return isFunction(this.data.save) ?
            fromCallback(cb => (<Function><object>this.data.save)(cb)) :
            pure(<void>undefined);

    }

    regenerate(): Future<void> {

        return isFunction(this.data.regenerate) ?
            fromCallback(cb => (<Function><object>this.data.regenerate)(cb)) :
            pure(<void>undefined);

    }

    destroy(): Future<void> {

        return isFunction(this.data.destroy) ?
            fromCallback(cb => (<Function><object>this.data.destroy)(cb)) :
            pure(<void>undefined);

    }

}

/**
 * @private
 */
export const getSessionValue = (session: Object, key: string) => {

    let data = <Object>(session[SESSION_DATA] || {});
    return path.get(key, data);

}

/**
 * @private
 */
export const getSessionValueAsString = (session: Object, key: string) => {

    let data = <Object>(session[SESSION_DATA] || {});
    return path.getString(key, data);

}

/**
 * @private
 */
export const getSessionValueOrElse =
    (session: Object, key: string, other: Value) => {

        let data = <Object>(session[SESSION_DATA] || {});
        return path.getDefault(key, data, other);

    }

/**
 * @private
 */
export const setSessionValue =
    (session: Object, key: string, value: Value, desc: Descriptor) => {

        let data = <Object>(session[SESSION_DATA] || {});
        let descs = <Object>(session[SESSION_DESCRIPTORS] || {});

        session[SESSION_DATA] = path.set(key, value, data);

        descs[key] = <Object>desc;
        session[SESSION_DESCRIPTORS] = <Object>descs;

    }

/**
 * @private
 */
export const deleteSessionKey = (session: Object, key: string) => {

    let data = <Object>(session[SESSION_DATA] || {});
    let descs = <Object>(session[SESSION_DESCRIPTORS] || {});

    session[SESSION_DATA] =
        rcompact(path.set(key, <Value>undefined, data));

    delete descs[key];

    session[SESSION_DESCRIPTORS] = descs;

}

/**
 * get a value from session by key.
 *
 * The value is is wrapped in a Maybe to promote safe access.
 */
export const get = (key: path.Path): Action<Maybe<Value>> =>
    liftF(new Get(key, identity));

/**
 * getOrElse provides a value from session storage or an alternative
 * if it is == null.
 */
export const getOrElse = (key: path.Path, value: Value): Action<string> =>
    liftF(new GetOrElse(key, value, identity));

/**
 * set a value for a key in the session.
 */
export const set =
    (key: path.Path, value: Value, desc: Descriptor = {}): Action<undefined> =>
        liftF(new Set(key, value, desc, undefined));

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
