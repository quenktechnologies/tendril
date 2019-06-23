"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var record_1 = require("@quenk/noni/lib/data/record");
var function_1 = require("@quenk/noni/lib/data/function");
var future_1 = require("@quenk/noni/lib/control/monad/future");
/**
 * Dispatcher is used by the main App to dispatch hook events.
 *
 * Hooks are dispatched in parallel at the module level but at the
 * hook level the are executed sequentially.
 */
var Dispatcher = /** @class */ (function () {
    function Dispatcher(app) {
        this.app = app;
    }
    /**
     * init fires all the "init" hooks for all the installed modules.
     */
    Dispatcher.prototype.init = function () {
        var app = this.app;
        return future_1.parallel(record_1.values(record_1.map(app.state.contexts, function (c) {
            if (c.module.isJust()) {
                var m = c.module.get();
                var mHooks = maybe_1.fromNullable(m.hooks.init);
                if (mHooks.isNothing())
                    return future_1.pure(undefined);
                var hooks = mHooks.get();
                return Array.isArray(hooks) ?
                    future_1.sequential(hooks.map(function (f) { return f(app); }))
                        .map(function_1.noop) :
                    hooks(app);
            }
            else {
                return future_1.pure(undefined);
            }
        })))
            .map(function_1.noop);
    };
    /**
     * connected fires all the "connected" hooks when all services have been
     * connected.
     */
    Dispatcher.prototype.connected = function () {
        var app = this.app;
        return future_1.parallel(record_1.values(record_1.map(app.state.contexts, function (c) {
            if (c.module.isJust()) {
                var m = c.module.get();
                var mHooks = maybe_1.fromNullable(m.hooks.connected);
                if (mHooks.isNothing())
                    return future_1.pure(undefined);
                var hooks = mHooks.get();
                return (Array.isArray(hooks)) ?
                    future_1.sequential(hooks.map(function (f) { return f(app); }))
                        .map(function () { }) :
                    hooks(app);
            }
            else {
                return future_1.pure(undefined);
            }
        })))
            .map(function_1.noop);
    };
    /**
     * stared fires the "started" hooks when the app has started servicing
     * requests.
     */
    Dispatcher.prototype.started = function () {
        var app = this.app;
        return future_1.parallel(record_1.values(record_1.map(app.state.contexts, function (c) {
            if (c.module.isJust()) {
                var m = c.module.get();
                var mHooks = maybe_1.fromNullable(m.hooks.started);
                if (mHooks.isNothing())
                    return future_1.pure(undefined);
                var hooks = mHooks.get();
                return Array.isArray(hooks) ?
                    future_1.sequential(hooks.map(function (f) { return f(app); }))
                        .map(function () { }) :
                    hooks(app);
            }
            else {
                return future_1.pure(undefined);
            }
        })))
            .map(function_1.noop);
    };
    return Dispatcher;
}());
exports.Dispatcher = Dispatcher;
//# sourceMappingURL=hooks.js.map