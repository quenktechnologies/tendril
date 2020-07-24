"use strict";
/**
 * The Per Request Storage module (PRS) provides an API for storing small
 * amounts of data that exist only for the duration of a request.
 *
 * This APIs primary purpose is to provide a way for filters to share data
 * with each other, without modifying the Request object.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.exists = exports.remove = exports.set = exports.getOrElse = exports.getString = exports.get = exports.Exists = exports.Remove = exports.Set = exports.GetOrElse = exports.GetString = exports.Get = void 0;
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
        return future_1.pure(this.next(path.get(this.key, ctx.prs)));
    }
}
exports.Get = Get;
/**
 * GetString
 * @private
 */
class GetString extends Get {
    map(f) {
        return new GetString(this.key, function_1.compose(this.next, f));
    }
    exec(ctx) {
        return future_1.pure(this.next(path.getString(this.key, ctx.prs)));
    }
}
exports.GetString = GetString;
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
        return future_1.pure(this.next(path.getDefault(this.key, ctx.prs, this.value)));
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
        ctx.prs = path.set(this.key, this.value, ctx.prs);
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
        let prs = path.flatten(ctx.prs);
        delete prs[this.key];
        ctx.prs = path.unflatten(prs);
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
        return future_1.pure(this.next(path.get(this.key, ctx.prs).isJust()));
    }
}
exports.Exists = Exists;
/**
 * get a value from PRS.
 *
 * The value is is wrapped in a Maybe to promote safe access.
 */
exports.get = (key) => free_1.liftF(new Get(key, function_1.identity));
/**
 * getString from PRS.
 *
 * Retrieves a value that is cast to string via String(). If the value does
 * not exist, an empty string is returned.
 */
exports.getString = (key) => free_1.liftF(new GetString(key, function_1.identity));
/**
 * getOrElse provides a value from PRS or an alternative if it is == null.
 */
exports.getOrElse = (key, value) => free_1.liftF(new GetOrElse(key, value, function_1.identity));
/**
 * set will store a value in the PRS that can be later
 * read by filters or handlers that follow.
 *
 * When setting values it is recommended to use to namespace keys to avoid
 * collisions. For example:
 *
 * set('resource.search.query', {name: 'foo'});
 */
exports.set = (key, value) => free_1.liftF(new Set(key, value, undefined));
/**
 * remove a value from PRS.
 */
exports.remove = (key) => free_1.liftF(new Remove(key, undefined));
/**
 * exists checks whether a value exists in PRS or not.
 */
exports.exists = (key) => free_1.liftF(new Exists(key, function_1.identity));
//# sourceMappingURL=prs.js.map