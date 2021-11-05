"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dispatcher = void 0;
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const record_1 = require("@quenk/noni/lib/data/record");
const function_1 = require("@quenk/noni/lib/data/function");
const future_1 = require("@quenk/noni/lib/control/monad/future");
/**
 * Dispatcher is used by the main App to dispatch hook events.
 *
 * Hooks are dispatched in parallel at the app level but sequentially
 * at the module level.
 */
class Dispatcher {
    constructor(app) {
        this.app = app;
    }
    /**
     * init fires the "init" hook.
     */
    init() {
        let { app } = this;
        return (0, future_1.parallel)((0, record_1.values)((0, record_1.map)(app.modules, (m) => {
            let mHooks = (0, maybe_1.fromNullable)(m.hooks.init);
            if (mHooks.isNothing())
                return (0, future_1.pure)(undefined);
            let hooks = mHooks.get();
            return Array.isArray(hooks) ?
                (0, future_1.sequential)(hooks.map(f => f(app)))
                    .map(function_1.noop) :
                hooks(app);
        })))
            .map(function_1.noop);
    }
    /**
     * connected fires all the "connected" hook when all remote connections
     * have been established.
     */
    connected() {
        let { app } = this;
        return (0, future_1.parallel)((0, record_1.values)((0, record_1.map)(app.modules, (m) => {
            let mHooks = (0, maybe_1.fromNullable)(m.hooks.connected);
            if (mHooks.isNothing())
                return (0, future_1.pure)(undefined);
            let hooks = mHooks.get();
            return (Array.isArray(hooks)) ?
                (0, future_1.sequential)(hooks.map(f => f(app)))
                    .map(() => { }) :
                hooks(app);
        })))
            .map(function_1.noop);
    }
    /**
     * stared fires the "started" hook when the app has started listening
     * for requests.
     */
    started() {
        let { app } = this;
        return (0, future_1.parallel)((0, record_1.values)((0, record_1.map)(app.modules, (m) => {
            let mHooks = (0, maybe_1.fromNullable)(m.hooks.started);
            if (mHooks.isNothing())
                return (0, future_1.pure)(undefined);
            let hooks = mHooks.get();
            return Array.isArray(hooks) ?
                (0, future_1.sequential)(hooks.map(f => f(app)))
                    .map(() => { }) :
                hooks(app);
        })))
            .map(function_1.noop);
    }
}
exports.Dispatcher = Dispatcher;
//# sourceMappingURL=hooks.js.map