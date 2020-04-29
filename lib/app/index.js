"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path_1 = require("path");
var function_1 = require("@quenk/noni/lib/data/function");
var record_1 = require("@quenk/noni/lib/data/record");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var either_1 = require("@quenk/noni/lib/data/either");
var function_2 = require("@quenk/noni/lib/data/function");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var vm_1 = require("@quenk/potoo/lib/actor/system/vm");
var server_1 = require("../net/http/server");
var connection_1 = require("./connection");
var data_1 = require("./module/data");
var template_1 = require("./module/template");
var hooks_1 = require("./hooks");
var defaultServConf = { port: 2407, host: '0.0.0.0' };
var dconf = { log: { level: 3 } };
/**
 * App is the main entry point to the framework.
 *
 * An App serves as an actor system for all the modules of the application.
 * It configures routing of requests for each module and makes whatever services
 * the user desires available via child actors.
 */
var App = /** @class */ (function () {
    function App(provider) {
        this.provider = provider;
        this.main = this.provider(this);
        this.vm = vm_1.PVM.create(this, this.main.app && this.main.app.system || dconf);
        this.modules = {};
        this.server = new server_1.Server(template_1.getServerConf(this.main, defaultServConf));
        this.pool = connection_1.getInstance();
        this.hooks = new hooks_1.Dispatcher(this);
    }
    App.prototype.exec = function (i, s) {
        return this.vm.exec(i, s);
    };
    App.prototype.execNow = function (i, s) {
        return this.vm.execNow(i, s);
    };
    /**
     * spawn a regular actor from a template.
     *
     * This actor must use the same Context type as the App.
     */
    App.prototype.spawn = function (tmpl) {
        this.vm.spawn(tmpl);
        return this;
    };
    /**
     * spawnModule (not a generic actor) from a template.
     *
     * A module must have a parent unless it is the root module of the app.
     */
    App.prototype.spawnModule = function (path, parent, tmpl) {
        var _this = this;
        var module = tmpl.create(this);
        var t = record_1.merge(tmpl, { create: function () { return module; } });
        var address = parent.isNothing() ?
            this.vm.spawn(t) :
            parent.get().module.spawn(t);
        var app = express();
        var mctx = {
            path: path,
            address: address,
            parent: parent,
            app: app,
            module: module,
            hooks: template_1.getHooks(t),
            template: t,
            middleware: {
                enabled: template_1.getEnabledMiddleware(t),
                available: template_1.getAvailableMiddleware(t)
            },
            routes: template_1.getRoutes(t),
            show: template_1.getShowFun(t, parent),
            connections: template_1.getConnections(t),
            disabled: t.disabled || false,
            redirect: maybe_1.nothing()
        };
        this.modules[address] = mctx;
        if (t.app && t.app.modules) {
            var mmctx_1 = maybe_1.just(mctx);
            return future_1.sequential(record_1.mapTo(t.app.modules, function (c, k) {
                return _this.spawnModule(k, mmctx_1, c(_this));
            }))
                .chain(function () { return future_1.pure(address); });
        }
        else {
            return future_1.pure(address);
        }
    };
    /**
     * installMiddleware at the specified mount point.
     *
     * If no module exists there, the attempt will be ignored.
     */
    App.prototype.installMiddleware = function (path, handler) {
        var _this = this;
        return data_1.getModule(this.modules, path)
            .map(function (m) { return m.app.use(handler); })
            .map(function () { return _this; })
            .orJust(function () { return _this; })
            .get();
    };
    /**
     * initialize the App
     *
     * Invokes the init hooks of all modules.
     */
    App.prototype.initialize = function () {
        var _this = this;
        return this.hooks.init().map(function () { return _this; });
    };
    /**
     * connections opens all the connections the modules of the App have
     * declared.
     *
     * Connections are open in parallel, any failing will prevent the whole
     * application from booting.
     */
    App.prototype.connections = function () {
        var _this = this;
        return record_1.reduce(this.modules, this.pool, function (p, m) {
            record_1.map(m.connections, function (c, k) { return p.add(k, c); });
            return p;
        })
            .open()
            .chain(function () { return _this.hooks.connected(); })
            .map(function () { return _this; });
    };
    /**
     * middlewares installs the middleware each module declares.
     */
    App.prototype.middlewares = function () {
        return record_1.reduce(this.modules, future_1.pure(this), function (p, c) { return applyMware(p, c); });
    };
    /**
     * routing installs all the routes of each module and creates a tree
     * out of express.
     */
    App.prototype.routing = function () {
        var _this = this;
        return future_1.attempt(function () { return record_1.map(_this.modules, function (m) {
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
            if (t.app && t.app.notFoundHandler)
                m.app.use(mod.runInContext([t.app.notFoundHandler]));
            if (t.app && t.app.errorHandler)
                m.app.use(mod.runInContextWithError(t.app.errorHandler));
            m.parent.map(function (p) { return p.app.use(path_1.join('/', m.path), m.app); });
        }); })
            .map(function_2.cons(this));
    };
    /**
     * listen for incoming connections.
     */
    App.prototype.listen = function () {
        var mmodule = data_1.getModule(this.modules, mainPath(this.main.id));
        if (mmodule.isJust())
            return this.server.listen(mmodule.get().app).map(function_1.noop);
        else
            return future_1.raise(new Error('Server not initialized!'));
    };
    /**
     * start the App.
     */
    App.prototype.start = function () {
        var _this = this;
        return this
            .spawnModule(mainPath(this.main.id), maybe_1.nothing(), this.main)
            .chain(function () { return _this.initialize(); })
            .chain(function () { return _this.connections(); })
            .chain(function () { return _this.middlewares(); })
            .chain(function () { return _this.routing(); })
            .chain(function () { return future_1.parallel([_this.listen(), _this.hooks.started()]); })
            .map(function () { return _this; });
    };
    App.prototype.stop = function () {
        var _this = this;
        return this
            .server
            .stop()
            .chain(function () { return _this.pool.close(); })
            .chain(function () { return _this.vm.stop(); })
            .map(function () {
            _this.pool.store = {};
        });
    };
    return App;
}());
exports.App = App;
var mainPath = function (path) { return (path != null) ? path : '/'; };
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
//# sourceMappingURL=index.js.map