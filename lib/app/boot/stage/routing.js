"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingStage = void 0;
var path_1 = require("path");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var record_1 = require("@quenk/noni/lib/data/record");
/**
 * RoutingStage sets up all the Application routing in one go.
 */
var RoutingStage = /** @class */ (function () {
    function RoutingStage(modules) {
        this.modules = modules;
        this.name = 'routing';
    }
    RoutingStage.prototype.execute = function () {
        var modules = this.modules;
        return future_1.attempt(function () { return record_1.map(modules, function (m) {
            var mod = m.module;
            var t = m.template;
            var routes = m.routes(m.module);
            if (t.app && t.app.filters) {
                var filters_1 = t.app.filters;
                mod.install(routes.map(function (r) { return ({
                    method: r.method,
                    path: r.path,
                    filters: __spreadArrays(filters_1, r.filters)
                }); }));
            }
            else {
                mod.install(routes);
            }
            if (t.app && t.app.on && t.app.on.notFound)
                m.app.use(mod.runInContext([t.app.on.notFound]));
            if (t.app && t.app.on && t.app.on.internalError)
                m.app.use(mod.runInContextWithError(t.app.on.internalError));
            m.parent.map(function (p) { return p.app.use(path_1.join('/', m.path), m.app); });
        }); }).map(function () { return undefined; });
    };
    return RoutingStage;
}());
exports.RoutingStage = RoutingStage;
//# sourceMappingURL=routing.js.map