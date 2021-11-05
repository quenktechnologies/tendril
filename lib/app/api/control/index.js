"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abort = exports.fork = exports.value = exports.noop = exports.next = exports.Abort = exports.Noop = exports.Next = exports.Fork = exports.Value = void 0;
const free_1 = require("@quenk/noni/lib/control/monad/free");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const function_1 = require("@quenk/noni/lib/data/function");
const __1 = require("../");
/**
 * Value
 * @private
 */
class Value extends __1.Api {
    constructor(value, next) {
        super(next);
        this.value = value;
        this.next = next;
    }
    map(f) {
        return new Value(this.value, (0, function_1.compose)(this.next, f));
    }
    exec(_) {
        return (0, future_1.pure)(this.next(this.value));
    }
}
exports.Value = Value;
/**
 * Fork
 * @private
 */
class Fork extends __1.Api {
    constructor(f, next) {
        super(next);
        this.f = f;
        this.next = next;
    }
    map(f) {
        return new Fork(this.f, (0, function_1.compose)(this.next, f));
    }
    exec(_) {
        let { f, next } = this;
        return f.map(next);
    }
}
exports.Fork = Fork;
/**
 * Next
 * @private
 */
class Next extends __1.Api {
    constructor(request, next) {
        super(next);
        this.request = request;
        this.next = next;
    }
    map(f) {
        return new Next(this.request, f(this.next));
    }
    exec(ctx) {
        ctx.request = this.request;
        return ctx.next();
    }
}
exports.Next = Next;
/**
 * Noop
 * @private
 */
class Noop extends __1.Api {
    constructor(next) {
        super(next);
        this.next = next;
    }
    map(f) {
        return new Noop(f(this.next));
    }
    exec(_) {
        return (0, future_1.pure)(this.next);
    }
}
exports.Noop = Noop;
/**
 * Abort
 * @private
 */
class Abort extends __1.Api {
    constructor(next) {
        super(next);
        this.next = next;
    }
    map(f) {
        return new Abort(f(this.next));
    }
    exec(c) {
        return c.abort();
    }
}
exports.Abort = Abort;
/**
 * next gives the go ahead to interpret the
 * actions of the next Filter chain.
 *
 * This action allows the Request in the context to be modified and
 * short-circuits the current chain.
 */
const next = (r) => (0, free_1.liftF)(new Next(r, undefined));
exports.next = next;
/**
 * noop (does nothing).
 */
const noop = () => (0, free_1.liftF)(new Noop(undefined));
exports.noop = noop;
/**
 * value wraps a value so that it is available to the next value in the
 * chain.
 */
const value = (value) => (0, free_1.liftF)(new Value(value, function_1.identity));
exports.value = value;
/**
 * fork suspends execution for a Future to execute and provide a value.
 */
const fork = (f) => (0, free_1.liftF)(new Fork(f, function_1.identity));
exports.fork = fork;
/**
 * abort ends the processing of the current filter chain.
 *
 * This halts the Context's chain and any chain it is directly part of.
 * Note: If this API is used, then a response should be sent to the client
 * first to avoid the browser waiting for a response.
 */
const abort = () => (0, free_1.liftF)(new Abort(undefined));
exports.abort = abort;
//# sourceMappingURL=index.js.map