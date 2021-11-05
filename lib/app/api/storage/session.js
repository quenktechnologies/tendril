"use strict";
/**
 * The session storage module provides apis for storing session data.
 *
 * "app.session.enable" must be set to true in order for these apis to work,
 * they fail silently otherwise.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = exports.destroy = exports.regenerate = exports.exists = exports.remove = exports.set = exports.getOrElse = exports.get = exports.deleteSessionKey = exports.setSessionValue = exports.getSessionValueOrElse = exports.getSessionValueAsString = exports.getSessionValue = exports.EnabledSessionStorage = exports.DisabledSessionStorage = exports.Save = exports.Destroy = exports.Regenerate = exports.Exists = exports.Remove = exports.Set = exports.GetOrElse = exports.Get = exports.SESSION_DESCRIPTORS = exports.SESSION_DATA = void 0;
const path = require("@quenk/noni/lib/data/record/path");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const function_1 = require("@quenk/noni/lib/data/function");
const free_1 = require("@quenk/noni/lib/control/monad/free");
const type_1 = require("@quenk/noni/lib/data/type");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const record_1 = require("@quenk/noni/lib/data/record");
const __1 = require("../");
exports.SESSION_DATA = 'tendril.$data';
exports.SESSION_DESCRIPTORS = 'tendril.$descriptors';
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
        return new Get(this.key, (0, function_1.compose)(this.next, f));
    }
    exec(ctx) {
        return (0, future_1.pure)(this.next(ctx.request.session.get(this.key)));
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
        return new GetOrElse(this.key, this.value, (0, function_1.compose)(this.next, f));
    }
    exec(ctx) {
        return (0, future_1.pure)(this.next(ctx.request.session.getOrElse(this.key, this.value)));
    }
}
exports.GetOrElse = GetOrElse;
/**
 * Set
 * @private
 */
class Set extends __1.Api {
    constructor(key, value, desc, next) {
        super(next);
        this.key = key;
        this.value = value;
        this.desc = desc;
        this.next = next;
    }
    map(f) {
        return new Set(this.key, this.value, this.desc, f(this.next));
    }
    exec(ctx) {
        ctx.request.session.setWithDescriptor(this.key, this.value, this.desc);
        return (0, future_1.pure)(this.next);
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
        ctx.request.session.remove(this.key);
        return (0, future_1.pure)(this.next);
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
        return new Exists(this.key, (0, function_1.compose)(this.next, f));
    }
    exec(ctx) {
        return (0, future_1.pure)(this.next(ctx.request.session.exists(this.key)));
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
    exec(ctx) {
        return ctx
            .request
            .session
            .regenerate()
            .chain(() => (0, future_1.pure)(this.next));
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
    exec(ctx) {
        return ctx
            .request
            .session
            .destroy()
            .chain(() => (0, future_1.pure)(this.next));
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
    exec(ctx) {
        return ctx
            .request
            .session
            .save()
            .chain(() => (0, future_1.pure)(this.next));
    }
}
exports.Save = Save;
/**
 * @private
 */
class DisabledSessionStorage {
    warn(method) {
        console.warn(`[DisabledSessionStorage#${method}]: session storage is not enabled!`);
    }
    isEnabled() {
        return false;
    }
    get(_key) {
        this.warn('get');
        return (0, maybe_1.nothing)();
    }
    getOrElse(_key, alt) {
        this.warn('getOrElse');
        return alt;
    }
    exists(_key) {
        this.warn('exists');
        return false;
    }
    set(_key, _value) {
        this.warn('set');
        return this;
    }
    setWithDescriptor(_key, _value, _desc) {
        this.warn('setWithDescriptor');
        return this;
    }
    remove(_) {
        this.warn('remove');
        return this;
    }
    reset() {
        this.warn('reset');
        return this;
    }
    save() {
        this.warn('save');
        return (0, future_1.pure)(undefined);
    }
    regenerate() {
        this.warn('regenerate');
        return (0, future_1.pure)(undefined);
    }
    destroy() {
        this.warn('destroy');
        return (0, future_1.pure)(undefined);
    }
}
exports.DisabledSessionStorage = DisabledSessionStorage;
/**
 * EnabledSessionStorage class.
 */
class EnabledSessionStorage {
    /**
     * @private
     */
    constructor(data) {
        this.data = data;
    }
    /**
     * fromExpress constructs a SessionStorage instance from an express
     * Request.
     *
     * If session support is not enabled, a DisabledSessionStorage will be
     * provided instead.
     */
    static fromExpress(r) {
        return (0, type_1.isObject)(r.session) ?
            new EnabledSessionStorage(r.session) :
            new DisabledSessionStorage();
    }
    /**
     * @private
     */
    target() {
        return (this.data && this.data[exports.SESSION_DATA] || {});
    }
    /**
     * @private
     */
    descriptors() {
        return (this.data && this.data[exports.SESSION_DESCRIPTORS] || {});
    }
    isEnabled() {
        return (0, type_1.isObject)(this.data);
    }
    get(key) {
        return path.get(key, this.target());
    }
    getOrElse(key, alt) {
        return path.getDefault(key, this.target(), alt);
    }
    exists(key) {
        return path.get(key, this.target()).isJust();
    }
    set(key, value) {
        return this.setWithDescriptor(key, value, {});
    }
    setWithDescriptor(key, value, desc) {
        let target = this.target();
        let descs = this.descriptors();
        this.data[exports.SESSION_DATA] = path.set(key, value, target);
        descs[key] = desc;
        this.data[exports.SESSION_DESCRIPTORS] = descs;
        return this;
    }
    remove(key) {
        let target = this.target();
        let descs = this.descriptors();
        this.data[exports.SESSION_DATA] =
            (0, record_1.rcompact)(path.set(key, undefined, target));
        delete descs[key];
        this.data[exports.SESSION_DESCRIPTORS] = descs;
        return this;
    }
    reset() {
        this.data[exports.SESSION_DATA] = {};
        return this;
    }
    save() {
        return (0, type_1.isFunction)(this.data.save) ?
            (0, future_1.fromCallback)(cb => this.data.save(cb)) :
            (0, future_1.pure)(undefined);
    }
    regenerate() {
        return (0, type_1.isFunction)(this.data.regenerate) ?
            (0, future_1.fromCallback)(cb => this.data.regenerate(cb)) :
            (0, future_1.pure)(undefined);
    }
    destroy() {
        return (0, type_1.isFunction)(this.data.destroy) ?
            (0, future_1.fromCallback)(cb => this.data.destroy(cb)) :
            (0, future_1.pure)(undefined);
    }
}
exports.EnabledSessionStorage = EnabledSessionStorage;
/**
 * @private
 */
const getSessionValue = (session, key) => {
    let data = (session[exports.SESSION_DATA] || {});
    return path.get(key, data);
};
exports.getSessionValue = getSessionValue;
/**
 * @private
 */
const getSessionValueAsString = (session, key) => {
    let data = (session[exports.SESSION_DATA] || {});
    return path.getString(key, data);
};
exports.getSessionValueAsString = getSessionValueAsString;
/**
 * @private
 */
const getSessionValueOrElse = (session, key, other) => {
    let data = (session[exports.SESSION_DATA] || {});
    return path.getDefault(key, data, other);
};
exports.getSessionValueOrElse = getSessionValueOrElse;
/**
 * @private
 */
const setSessionValue = (session, key, value, desc) => {
    let data = (session[exports.SESSION_DATA] || {});
    let descs = (session[exports.SESSION_DESCRIPTORS] || {});
    session[exports.SESSION_DATA] = path.set(key, value, data);
    descs[key] = desc;
    session[exports.SESSION_DESCRIPTORS] = descs;
};
exports.setSessionValue = setSessionValue;
/**
 * @private
 */
const deleteSessionKey = (session, key) => {
    let data = (session[exports.SESSION_DATA] || {});
    let descs = (session[exports.SESSION_DESCRIPTORS] || {});
    session[exports.SESSION_DATA] =
        (0, record_1.rcompact)(path.set(key, undefined, data));
    delete descs[key];
    session[exports.SESSION_DESCRIPTORS] = descs;
};
exports.deleteSessionKey = deleteSessionKey;
/**
 * get a value from session by key.
 *
 * The value is is wrapped in a Maybe to promote safe access.
 */
const get = (key) => (0, free_1.liftF)(new Get(key, function_1.identity));
exports.get = get;
/**
 * getOrElse provides a value from session storage or an alternative
 * if it is == null.
 */
const getOrElse = (key, value) => (0, free_1.liftF)(new GetOrElse(key, value, function_1.identity));
exports.getOrElse = getOrElse;
/**
 * set a value for a key in the session.
 */
const set = (key, value, desc = {}) => (0, free_1.liftF)(new Set(key, value, desc, undefined));
exports.set = set;
/**
 * remove a value from the session.
 */
const remove = (key) => (0, free_1.liftF)(new Remove(key, undefined));
exports.remove = remove;
/**
 * exists checks whether a value exists in the session.
 */
const exists = (key) => (0, free_1.liftF)(new Exists(key, function_1.identity));
exports.exists = exists;
/**
 * regenerate causes the session to be regenerated and a new SID set.
 */
const regenerate = () => (0, free_1.liftF)(new Regenerate(undefined));
exports.regenerate = regenerate;
/**
 * destroy the session.
 */
const destroy = () => (0, free_1.liftF)(new Destroy(undefined));
exports.destroy = destroy;
/**
 * Save session data.
 *
 * This causes session data to be stored immediately instead of at the end
 * of the request.
 */
const save = () => (0, free_1.liftF)(new Save(undefined));
exports.save = save;
//# sourceMappingURL=session.js.map