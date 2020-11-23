"use strict";
/**
 * The Per Request Storage module (PRS) provides an API for storing small
 * amounts of data that exist only for the duration of a request.
 *
 * This APIs primary purpose is to provide a way for filters to share data
 * with each other, without modifying the Request object.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.exists = exports.remove = exports.set = exports.getOrElse = exports.get = exports.PRSStorage = exports.Exists = exports.Remove = exports.Set = exports.GetOrElse = exports.Get = void 0;
/** imports */
const path = require("@quenk/noni/lib/data/record/path");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const free_1 = require("@quenk/noni/lib/control/monad/free");
const function_1 = require("@quenk/noni/lib/data/function");
const __1 = require("../");
/**
 * Get
 * @private
 */
class Get extends __1.Api {
    constructor(key, next) {
        super(next);
        this.key = key;
        this.next = next;
    }
    map(f) {
        return new Get(this.key, function_1.compose(this.next, f));
    }
    exec(ctx) {
        return future_1.pure(this.next(ctx.request.prs.get(this.key)));
    }
}
exports.Get = Get;
/**
 * GetOrElse
 * @private
 */
class GetOrElse extends __1.Api {
    constructor(key, value, next) {
        super(next);
        this.key = key;
        this.value = value;
        this.next = next;
    }
    map(f) {
        return new GetOrElse(this.key, this.value, function_1.compose(this.next, f));
    }
    exec(ctx) {
        return future_1.pure(this.next(ctx.request.prs.getOrElse(this.key, this.value)));
    }
}
exports.GetOrElse = GetOrElse;
/**
 * Set
 * @private
 */
class Set extends __1.Api {
    constructor(key, value, next) {
        super(next);
        this.key = key;
        this.value = value;
        this.next = next;
    }
    map(f) {
        return new Set(this.key, this.value, f(this.next));
    }
    exec(ctx) {
        ctx.request.prs.set(this.key, this.value);
        return future_1.pure(this.next);
    }
}
exports.Set = Set;
/**
 * Remove
 * @private
 */
class Remove extends __1.Api {
    constructor(key, next) {
        super(next);
        this.key = key;
        this.next = next;
    }
    map(f) {
        return new Remove(this.key, f(this.next));
    }
    exec(ctx) {
        ctx.request.prs.remove(this.key);
        return future_1.pure(this.next);
    }
}
exports.Remove = Remove;
/**
 * Exists
 * @private
 */
class Exists extends __1.Api {
    constructor(key, next) {
        super(next);
        this.key = key;
        this.next = next;
    }
    map(f) {
        return new Exists(this.key, function_1.compose(this.next, f));
    }
    exec(ctx) {
        return future_1.pure(this.next(ctx.request.prs.exists(this.key)));
    }
}
exports.Exists = Exists;
/**
 * PRSStorage class.
 *
 * This is used behind the scens to provide the prs api.
 */
class PRSStorage {
    constructor(data = {}) {
        this.data = data;
    }
    get(key) {
        return path.get(key, this.data);
    }
    getOrElse(key, alt) {
        return path.getDefault(key, this.data, alt);
    }
    exists(key) {
        return path.get(key, this.data).isJust();
    }
    set(key, value) {
        this.data = path.set(key, value, this.data);
        return this;
    }
    remove(key) {
        let prs = path.flatten(this.data);
        delete prs[key];
        this.data = path.unflatten(prs);
        return this;
    }
    reset() {
        this.data = {};
        return this;
    }
}
exports.PRSStorage = PRSStorage;
/**
 * get a value from PRS.
 *
 * The value is is wrapped in a Maybe to promote safe access.
 */
const get = (key) => free_1.liftF(new Get(key, function_1.identity));
exports.get = get;
/**
 * getOrElse provides a value from PRS or an alternative if it is == null.
 */
const getOrElse = (key, value) => free_1.liftF(new GetOrElse(key, value, function_1.identity));
exports.getOrElse = getOrElse;
/**
 * set will store a value in the PRS that can be later
 * read by filters or handlers that follow.
 *
 * When setting values it is recommended to use to namespace keys to avoid
 * collisions. For example:
 *
 * set('resource.search.query', {name: 'foo'});
 */
const set = (key, value) => free_1.liftF(new Set(key, value, undefined));
exports.set = set;
/**
 * remove a value from PRS.
 */
const remove = (key) => free_1.liftF(new Remove(key, undefined));
exports.remove = remove;
/**
 * exists checks whether a value exists in PRS or not.
 */
const exists = (key) => free_1.liftF(new Exists(key, function_1.identity));
exports.exists = exists;
//# sourceMappingURL=prs.js.map