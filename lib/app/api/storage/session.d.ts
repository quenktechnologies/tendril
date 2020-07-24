/**
 * The session storage module provides apis for storing session data.
 *
 * "app.session.enable" must be set to true in order for these apis to work,
 * they fail silently otherwise.
 */
/** imports */
import * as path from '@quenk/noni/lib/data/record/path';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Value } from '@quenk/noni/lib/data/jsonx';
import { Type } from '@quenk/noni/lib/data/type';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Action, Api, Context } from '../';
export declare const SESSION_STORAGE_KEY = "tendril";
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
 * GetString
 * @private
 */
export declare class GetString<A> extends Get<A> {
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
    next: A;
    constructor(key: path.Path, value: Value, next: A);
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
    exec({ request }: Context<A>): Future<A>;
}
/**
 * Destroy
 * @private
 */
export declare class Destroy<A> extends Api<A> {
    next: A;
    constructor(next: A);
    map<B>(f: (n: A) => B): Destroy<B>;
    exec({ request }: Context<A>): Future<A>;
}
/**
 * Save
 * @private
 */
export declare class Save<A> extends Api<A> {
    next: A;
    constructor(next: A);
    map<B>(f: (n: A) => B): Save<B>;
    exec({ request }: Context<A>): Future<A>;
}
/**
 * get a value from session by key.
 *
 * The value is is wrapped in a Maybe to promote safe access.
 */
export declare const get: (key: path.Path) => Action<Maybe<Value>>;
/**
 * getString from session storage.
 *
 * Retrieves a value that is cast to string via String(). If the value does
 * not exist, an empty string is returned.
 */
export declare const getString: (key: path.Path) => Action<string>;
/**
 * getOrElse provides a value from session storage or an alternative
 * if it is == null.
 */
export declare const getOrElse: (key: path.Path, value: Value) => Action<string>;
/**
 * set a value for a key in the session.
 */
export declare const set: (key: path.Path, value: Value) => Action<undefined>;
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
