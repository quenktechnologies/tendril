/**
 * The session storage module provides apis for storing session data.
 *
 * "app.session.enable" must be set to true in order for these apis to work,
 * they fail silently otherwise.
 */
/** imports */
import * as express from 'express';
import * as path from '@quenk/noni/lib/data/record/path';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Object, Value } from '@quenk/noni/lib/data/jsonx';
import { Type } from '@quenk/noni/lib/data/type';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Action, Api, Context } from '../';
import { Storage } from './';
export declare const SESSION_DATA = "tendril.$data";
export declare const SESSION_DESCRIPTORS = "tendril.$descriptors";
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
    ttl?: number;
}
/**
 * SessionStorage acts as a bridge between the tendril applications and
 * the underlying express session store API.
 */
export interface SessionStorage extends Storage {
    /**
     * isEnabled returns true if session storage is enabled, false otherwise.
     */
    isEnabled(): boolean;
    /**
     * setWithDescriptor sets the value of a key in session storage along with
     * a descriptor.
     */
    setWithDescriptor(key: string, value: Value, desc: Descriptor): SessionStorage;
    /**
     * save the session data.
     *
     * Call this method to immediately persist any data written to the session.
     */
    save(): Future<void>;
    /**
     * regenerate the session.
     *
     * This hooks into the lower level API to invalidate the current session id
     * supplied by the client and issue a new one. All data stored in the
     * session will be lost, including data not set through this API.
     */
    regenerate(): Future<void>;
    /**
     * destroy the session.
     *
     * Everything comes to an end here.
     */
    destroy(): Future<void>;
}
/**
 * Get
 * @private
 */
export declare class Get<A> extends Api<A> {
    key: path.Path;
    next: (v: Type) => A;
    constructor(key: path.Path, next: (v: Type) => A);
    map<B>(f: (n: A) => B): Get<B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * GetOrElse
 * @private
 */
export declare class GetOrElse<A> extends Api<A> {
    key: path.Path;
    value: Value;
    next: (v: Type) => A;
    constructor(key: path.Path, value: Value, next: (v: Type) => A);
    map<B>(f: (n: A) => B): GetOrElse<B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * Set
 * @private
 */
export declare class Set<A> extends Api<A> {
    key: path.Path;
    value: Value;
    desc: Descriptor;
    next: A;
    constructor(key: path.Path, value: Value, desc: Descriptor, next: A);
    map<B>(f: (n: A) => B): Set<B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * Remove
 * @private
 */
export declare class Remove<A> extends Api<A> {
    key: path.Path;
    next: A;
    constructor(key: path.Path, next: A);
    map<B>(f: (n: A) => B): Remove<B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * Exists
 * @private
 */
export declare class Exists<A> extends Api<A> {
    key: path.Path;
    next: (v: Type) => A;
    constructor(key: path.Path, next: (v: Type) => A);
    map<B>(f: (n: A) => B): Exists<B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * Regenerate
 * @private
 */
export declare class Regenerate<A> extends Api<A> {
    next: A;
    constructor(next: A);
    map<B>(f: (n: A) => B): Regenerate<B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * Destroy
 * @private
 */
export declare class Destroy<A> extends Api<A> {
    next: A;
    constructor(next: A);
    map<B>(f: (n: A) => B): Destroy<B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * Save
 * @private
 */
export declare class Save<A> extends Api<A> {
    next: A;
    constructor(next: A);
    map<B>(f: (n: A) => B): Save<B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * @private
 */
export declare class DisabledSessionStorage implements SessionStorage {
    warn(method: string): void;
    isEnabled(): boolean;
    get(_key: string): Maybe<Value>;
    getOrElse(_key: string, alt: Value): Value;
    exists(_key: string): boolean;
    set(_key: string, _value: Value): DisabledSessionStorage;
    setWithDescriptor(_key: string, _value: Value, _desc: Descriptor): DisabledSessionStorage;
    remove(_: string): DisabledSessionStorage;
    reset(): DisabledSessionStorage;
    save(): Future<void>;
    regenerate(): Future<void>;
    destroy(): Future<void>;
}
/**
 * EnabledSessionStorage class.
 */
export declare class EnabledSessionStorage implements SessionStorage {
    data: Object;
    /**
     * @private
     */
    constructor(data: Object);
    /**
     * fromExpress constructs a SessionStorage instance from an express
     * Request.
     *
     * If session support is not enabled, a DisabledSessionStorage will be
     * provided instead.
     */
    static fromExpress(r: express.Request): SessionStorage;
    /**
     * @private
     */
    target(): Object;
    /**
     * @private
     */
    descriptors(): Object;
    isEnabled(): boolean;
    get(key: string): Maybe<Value>;
    getOrElse(key: string, alt: Value): Value;
    exists(key: string): boolean;
    set(key: string, value: Value): EnabledSessionStorage;
    setWithDescriptor(key: string, value: Value, desc: Descriptor): EnabledSessionStorage;
    remove(key: string): EnabledSessionStorage;
    reset(): EnabledSessionStorage;
    save(): Future<void>;
    regenerate(): Future<void>;
    destroy(): Future<void>;
}
/**
 * @private
 */
export declare const getSessionValue: (session: Object, key: string) => Maybe<Value>;
/**
 * @private
 */
export declare const getSessionValueAsString: (session: Object, key: string) => string;
/**
 * @private
 */
export declare const getSessionValueOrElse: (session: Object, key: string, other: Value) => Value;
/**
 * @private
 */
export declare const setSessionValue: (session: Object, key: string, value: Value, desc: Descriptor) => void;
/**
 * @private
 */
export declare const deleteSessionKey: (session: Object, key: string) => void;
/**
 * get a value from session by key.
 *
 * The value is is wrapped in a Maybe to promote safe access.
 */
export declare const get: (key: path.Path) => Action<Maybe<Value>>;
/**
 * getOrElse provides a value from session storage or an alternative
 * if it is == null.
 */
export declare const getOrElse: (key: path.Path, value: Value) => Action<string>;
/**
 * set a value for a key in the session.
 */
export declare const set: (key: path.Path, value: Value, desc?: Descriptor) => Action<undefined>;
/**
 * remove a value from the session.
 */
export declare const remove: (key: path.Path) => Action<undefined>;
/**
 * exists checks whether a value exists in the session.
 */
export declare const exists: (key: path.Path) => Action<boolean>;
/**
 * regenerate causes the session to be regenerated and a new SID set.
 */
export declare const regenerate: () => Action<undefined>;
/**
 * destroy the session.
 */
export declare const destroy: () => Action<undefined>;
/**
 * Save session data.
 *
 * This causes session data to be stored immediately instead of at the end
 * of the request.
 */
export declare const save: () => Action<undefined>;
