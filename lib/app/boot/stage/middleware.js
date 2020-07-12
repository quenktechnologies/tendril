"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareStage = void 0;
var future_1 = require("@quenk/noni/lib/control/monad/future");
var record_1 = require("@quenk/noni/lib/data/record");
var either_1 = require("@quenk/noni/lib/data/either");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
/**
 * MiddlewareStage installs the express middleware configured for
 * each module.
 */
var MiddlewareStage = /** @class */ (function () {
    function MiddlewareStage(app, modules) {
        this.app = app;
        this.modules = modules;
        this.name = 'middleware';
    }
    MiddlewareStage.prototype.execute = function () {
        var _a = this, app = _a.app, modules = _a.modules;
        return record_1.reduce(modules, future_1.pure(app), function (p, c) { return applyMware(p, c); })
            .chain(function () { return future_1.pure(undefined); });
    };
    return MiddlewareStage;
}());
exports.MiddlewareStage = MiddlewareStage;
var applyMware = function (app, m) {
    return m
        .middleware
        .enabled
        .reduce(swap(m), either_1.right([preroute(m)]))
        .map(function (list) { return m.app.use.apply(m.app, list); })
        .map(function () { return app; })
        .orRight(function (e) { return future_1.raise(e); })
        .takeRight();
};
var preroute = function (module) {
    return function (_, res, next) {
        return maybe_1.fromBoolean(module.disabled)
            .map(function () { return res.status(404).end(); })
            .orElse(function () { return module.redirect.map(function (r) {
            return res.redirect(r.status, r.location);
        }); })
            .orJust(function () { return next(); });
    };
};
var swap = function (m) { return function (p, c) {
    return m.middleware.available.hasOwnProperty(c) ?
        p
            .map(concatMware(m, c)) :
        m
            .parent
            .map(function (parent) { return swap(parent)(p, c); })
            .orJust(errMware(m.path, c))
            .get();
}; };
var concatMware = function (m, key) { return function (list) {
    return list.concat(m.middleware.available[key]);
}; };
var errMware = function (path, key) { return function () {
    return either_1.left(new Error(path + ": Unknown middleware \"" + key + "\"!"));
}; };
//# sourceMappingURL=middleware.js.map