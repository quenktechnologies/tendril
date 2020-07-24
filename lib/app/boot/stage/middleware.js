"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareStage = void 0;
const future_1 = require("@quenk/noni/lib/control/monad/future");
const record_1 = require("@quenk/noni/lib/data/record");
const either_1 = require("@quenk/noni/lib/data/either");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
/**
 * MiddlewareStage installs the express middleware configured for
 * each module.
 */
class MiddlewareStage {
    constructor(app, modules) {
        this.app = app;
        this.modules = modules;
        this.name = 'middleware';
    }
    execute() {
        let { app, modules } = this;
        return record_1.reduce(modules, future_1.pure(app), (p, c) => applyMware(p, c))
            .chain(() => future_1.pure(undefined));
    }
}
exports.MiddlewareStage = MiddlewareStage;
const applyMware = (app, m) => m
    .middleware
    .enabled
    .reduce(swap(m), either_1.right([preroute(m)]))
    .map(list => m.app.use.apply(m.app, list))
    .map(() => app)
    .orRight(e => future_1.raise(e))
    .takeRight();
const preroute = (module) => (_, res, next) => maybe_1.fromBoolean(module.disabled)
    .map(() => res.status(404).end())
    .orElse(() => module.redirect.map(r => res.redirect(r.status, r.location)))
    .orJust(() => next());
const swap = (m) => (p, c) => m.middleware.available.hasOwnProperty(c) ?
    p
        .map(concatMware(m, c)) :
    m
        .parent
        .map(parent => swap(parent)(p, c))
        .orJust(errMware(m.path, c))
        .get();
const concatMware = (m, key) => (list) => list.concat(m.middleware.available[key]);
const errMware = (path, key) => () => either_1.left(new Error(`${path}: Unknown middleware "${key}"!`));
//# sourceMappingURL=middleware.js.map