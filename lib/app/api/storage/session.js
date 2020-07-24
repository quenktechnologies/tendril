"use strict";
/**
 * The session storage module provides apis for storing session data.
 *
 * "app.session.enable" must be set to true in order for these apis to work,
 * they fail silently otherwise.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = exports.destroy = exports.regenerate = exports.exists = exports.remove = exports.set = exports.getOrElse = exports.getString = exports.get = exports.Save = exports.Destroy = exports.Regenerate = exports.Exists = exports.Remove = exports.Set = exports.GetOrElse = exports.GetString = exports.Get = exports.SESSION_STORAGE_KEY = void 0;
/** imports */
const path = require("@quenk/noni/lib/data/record/path");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const function_1 = require("@quenk/noni/lib/data/function");
const free_1 = require("@quenk/noni/lib/control/monad/free");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const __1 = require("../");
exports.SESSION_STORAGE_KEY = 'tendril';
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
        let session = ctx.request.session || {};
        let key = `${exports.SESSION_STORAGE_KEY}.${this.key}`;
        return future_1.pure(this.next(path.get(key, session)));
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
        let session = ctx.request.session || {};
        let key = `${exports.SESSION_STORAGE_KEY}.${this.key}`;
        return future_1.pure(this.next(path.getString(key, session)));
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
        let session = ctx.request.session || {};
        let key = `${exports.SESSION_STORAGE_KEY}.${this.key}`;
        return future_1.pure(this.next(path.getDefault(key, session, this.value)));
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
        let session = ctx.request.session || {};
        let store = (session[exports.SESSION_STORAGE_KEY] || {});
        session[exports.SESSION_STORAGE_KEY] = path.set(this.key, this.value, store);
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
        let session = ctx.request.session || {};
        let store = (session[exports.SESSION_STORAGE_KEY] || {});
        //TODO: actually remove the key once noni supports it.
        session[exports.SESSION_STORAGE_KEY] =
            path.set(this.key, undefined, store);
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
        let session = ctx.request.session || {};
        return future_1.pure(this.next(maybe_1.fromNullable(session[this.key]).isJust()));
    }
}
exports.Exists = Exists;
/**
 * Regenerate
 * @private
 */
class Regenerate extends __1.Api {
    constructor(next) {
        super(next);
        this.next = next;
    }
    map(f) {
        return new Regenerate(f(this.next));
    }
    exec({ request }) {
        if (request.session != null) {
            let session = request.session;
            return future_1.fromCallback(cb => session.regenerate(cb))
                .chain(() => future_1.pure(this.next));
        }
        return future_1.pure(this.next);
    }
}
exports.Regenerate = Regenerate;
/**
 * Destroy
 * @private
 */
class Destroy extends __1.Api {
    constructor(next) {
        super(next);
        this.next = next;
    }
    map(f) {
        return new Destroy(f(this.next));
    }
    exec({ request }) {
        if (request.session != null) {
            let session = request.session;
            return future_1.fromCallback(cb => session.destroy(cb))
                .chain(() => future_1.pure(this.next));
        }
        return future_1.pure(this.next);
    }
}
exports.Destroy = Destroy;
/**
 * Save
 * @private
 */
class Save extends __1.Api {
    constructor(next) {
        super(next);
        this.next = next;
    }
    map(f) {
        return new Save(f(this.next));
    }
    exec({ request }) {
        if (request.session != null) {
            let session = request.session;
            return future_1.fromCallback(cb => session.save(cb))
                .chain(() => future_1.pure(this.next));
        }
        return future_1.pure(this.next);
    }
}
exports.Save = Save;
/**
 * get a value from session by key.
 *
 * The value is is wrapped in a Maybe to promote safe access.
 */
exports.get = (key) => free_1.liftF(new Get(key, function_1.identity));
/**
 * getString from session storage.
 *
 * Retrieves a value that is cast to string via String(). If the value does
 * not exist, an empty string is returned.
 */
exports.getString = (key) => free_1.liftF(new GetString(key, function_1.identity));
/**
 * getOrElse provides a value from session storage or an alternative
 * if it is == null.
 */
exports.getOrElse = (key, value) => free_1.liftF(new GetOrElse(key, value, function_1.identity));
/**
 * set a value for a key in the session.
 */
exports.set = (key, value) => free_1.liftF(new Set(key, value, undefined));
/**
 * remove a value from the session.
 */
exports.remove = (key) => free_1.liftF(new Remove(key, undefined));
/**
 * exists checks whether a value exists in the session.
 */
exports.exists = (key) => free_1.liftF(new Exists(key, function_1.identity));
/**
 * regenerate causes the session to be regenerated and a new SID set.
 */
exports.regenerate = () => free_1.liftF(new Regenerate(undefined));
/**
 * destroy the session.
 */
exports.destroy = () => free_1.liftF(new Destroy(undefined));
/**
 * Save session data.
 *
 * This causes session data to be stored immediately instead of at the end
 * of the request.
 */
exports.save = () => free_1.liftF(new Save(undefined));
//# sourceMappingURL=session.js.map