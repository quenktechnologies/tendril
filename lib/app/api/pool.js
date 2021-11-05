"use strict";
/**
 * Here you will find api functions for interacting with the application's
 * connection pool.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkout = exports.Checkout = void 0;
/** imports */
const future_1 = require("@quenk/noni/lib/control/monad/future");
const free_1 = require("@quenk/noni/lib/control/monad/free");
const function_1 = require("@quenk/noni/lib/data/function");
const _1 = require("./");
/**
 * Checkout action.
 */
class Checkout extends _1.Api {
    constructor(name, next) {
        super(next);
        this.name = name;
        this.next = next;
    }
    map(f) {
        return new Checkout(this.name, (0, function_1.compose)(this.next, f));
    }
    exec({ module }) {
        return module.app.pool
            .get(this.name)
            .map(c => c.checkout().map(this.next))
            .orJust(() => (0, future_1.raise)(new Error(`Unknown connection:"${this.name}"!`)))
            .get();
    }
}
exports.Checkout = Checkout;
/**
 * checkout a Connection from the application's pool.
 */
const checkout = (name) => (0, free_1.liftF)(new Checkout(name, function_1.identity));
exports.checkout = checkout;
//# sourceMappingURL=pool.js.map