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
import { Context } from '../../context';
import { ActionM, Action } from '../';
/**
 * Get
 * @private
 */
export declare class Get<A> extends Action<A> {
    key: path.Path;
    next: (v: Type) => A;
    constructor(key: path.Path, next: (v: Type) => A);
    map<B>(f: (n: A) => B): Get<B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * Set
 * @private
 */
export declare class Set<A> extends Action<A> {
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
export declare class Remove<A> extends Action<A> {
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
export declare class Exists<A> extends Action<A> {
    key: path.Path;
    next: (v: Type) => A;
    constructor(key: path.Path, next: (v: Type) => A);
    map<B>(f: (n: A) => B): Exists<B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * get a value from session by key.
 *
 * The value is is wrapped in a Maybe to promote safe access.
 */
export declare const get: (key: path.Path) => ActionM<Maybe<Value>>;
/**
 * set a value for a key in the session.
 */
export declare const set: (key: path.Path, value: Value) => ActionM<undefined>;
/**
 * remove a value from the session.
 */
export declare const remove: (key: path.Path) => ActionM<undefined>;
/**
 * exists checks whether a value exists in the session.
 */
export declare const exists: (key: path.Path) => ActionM<boolean>;
