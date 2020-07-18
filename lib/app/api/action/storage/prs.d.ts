/**
 * The Per Request Storage module (PRS) provides an API for storing small
 * amounts of data that exist only for the duration of a request.
 *
 * This APIs primary purpose is to provide a way for filters to share data
 * with each other, without modifying the Request object.
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
 * get a value from PRS.
 *
 * The value is is wrapped in a Maybe to promote safe access.
 */
export declare const get: (key: path.Path) => ActionM<Maybe<Value>>;
/**
 * set will store a value in the PRS that can be later
 * read by filters or handlers that follow.
 *
 * When setting values it is recommended to use to namespace keys to avoid
 * collisions. For example:
 *
 * set('resource.search.query', {name: 'foo'});
 */
export declare const set: (key: path.Path, value: Value) => ActionM<undefined>;
/**
 * remove a value from PRS.
 */
export declare const remove: (key: path.Path) => ActionM<undefined>;
/**
 * exists checks whether a value exists in PRS or not.
 */
export declare const exists: (key: path.Path) => ActionM<boolean>;
