"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fork = exports.value = exports.next = exports.Next = exports.Fork = exports.Value = void 0;
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
        return new Value(this.value, function_1.compose(this.next, f));
    }
    exec(_) {
        return future_1.pure(this.next(this.value));
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
        return new Fork(this.f, function_1.compose(this.next, f));
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
 * next gives the go ahead to interpret the
 * actions of the next Filter chain.
 *
 * This action allows the Request in the context to be modified and
 * short-circuits the current chain.
 */
exports.next = (r) => free_1.liftF(new Next(r, undefined));
/**
 * value wraps a value so that it is available to the next value in the
 * chain.
 */
exports.value = (value) => free_1.liftF(new Value(value, function_1.identity));
/**
 * fork suspends execution for a Future to execute and provide a value.
 */
exports.fork = (f) => free_1.liftF(new Fork(f, function_1.identity));
//# sourceMappingURL=index.js.map