"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path_1 = require("path");
var record_1 = require("@quenk/noni/lib/data/record");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var either_1 = require("@quenk/noni/lib/data/either");
var function_1 = require("@quenk/noni/lib/data/function");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var state_1 = require("@quenk/potoo/lib/actor/system/state");
var scripts_1 = require("@quenk/potoo/lib/actor/resident/scripts");
var scripts_2 = require("@quenk/potoo/lib/actor/system/framework/scripts");
var framework_1 = require("@quenk/potoo/lib/actor/system/framework");
var scripts_3 = require("@quenk/potoo/lib/actor/system/vm/runtime/scripts");
var this_1 = require("@quenk/potoo/lib/actor/system/vm/runtime/this");
var server_1 = require("../net/http/server");
var connection_1 = require("./connection");
var context_1 = require("./actor/context");
var template_1 = require("./module/template");
var defaultServConf = { port: 2407, host: '0.0.0.0' };
/**
 * App is the main entry point to the framework.
 *
 * An App serves as an actor system for all the modules of the application.
 * It configures routing of requests for each module and makes whatever services
 * the user desires available via child actors.
 */
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    function App(provider, configuration) {
        if (configuration === void 0) { configuration = {}; }
        var _this = _super.call(this, configuration) || this;
        _this.provider = provider;
        _this.configuration = configuration;
        _this.state = newState(_this);
        _this.main = _this.provider(_this);
        _this.server = new server_1.Server(template_1.getServerConf(_this.main, defaultServConf));
        _this.pool = connection_1.getInstance();
        return _this;
    }
    App.prototype.init = function (c) { return c; };
    App.prototype.allocate = function (a, r, t) {
        return newContext(maybe_1.nothing(), a, r, t);
    };
    /**
     * tell a message to an actor in the system.
     */
    App.prototype.tell = function (to, msg) {
        (new this_1.This('$', this)).exec(new scripts_1.TellScript(to, msg));
        return this;
    };
    /**
     * spawn a regular actor from a template.
     *
     * This actor must use the same Context type as the App.
     */
    App.prototype.spawn = function (tmpl) {
        (new this_1.This('$', this)).exec(new scripts_2.SpawnScript('', tmpl));
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
        var app = express();
        var address = getModuleAddress(parent, path);
        var runtime = new this_1.This(address, this);
        var mctx = {
            path: path,
            address: address,
            parent: parent,
            module: module,
            app: app,
            hooks: template_1.getHooks(tmpl),
            middleware: {
                enabled: template_1.getEnabledMiddleware(tmpl),
                available: template_1.getAvailableMiddleware(tmpl)
            },
            routes: template_1.getRoutes(tmpl),
            show: template_1.getShowFun(tmpl, parent),
            connections: template_1.getConnections(tmpl),
            disabled: tmpl.disabled || false,
            redirect: maybe_1.nothing()
        };
        state_1.put(this.state, address, module.init(newContext(maybe_1.just(mctx), module, runtime, tmpl)));
        if (tmpl.app && tmpl.app.modules)
            record_1.map(tmpl.app.modules, function (m, k) {
                return _this.spawnModule(k, maybe_1.just(mctx), m(_this));
            });
        if (Array.isArray(tmpl.children))
            tmpl.children.forEach(function (c) {
                return runtime.exec(new scripts_2.SpawnScript(address, c));
            });
        if (tmpl.spawn != null)
            record_1.map(tmpl.spawn, function (c, id) { return runtime.exec(new scripts_2.SpawnScript(address, mergeSpawnable(id, c))); });
        return this;
    };
    /**
     * installMiddleware at the specified mount point.
     *
     * If no module exists there, the attempt will be ignored.
     */
    App.prototype.installMiddleware = function (path, handler) {
        var _this = this;
        return context_1.getModule(this.state, path)
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
        return future_1.parallel(record_1.values(record_1.map(this.state.contexts, initContext(this)))).map(function_1.cons(this));
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
        return record_1.reduce(this.state.contexts, this.pool, function (p, c) {
            return c
                .module
                .map(function (m) { return record_1.map(m.connections, function (c, k) { return p.add(k, c); }); })
                .map(function_1.cons(p))
                .orJust(function () { return p; })
                .get();
        })
            .open()
            .chain(function () { return future_1.parallel(record_1.values(record_1.map(_this.state.contexts, dispatchConnected(_this)))); })
            .map(function_1.cons(this));
    };
    /**
     * middlewares installs the middleware each module declares.
     */
    App.prototype.middlewares = function () {
        return record_1.reduce(this.state.contexts, future_1.pure(this), function (p, c) {
            return c
                .module
                .map(applyMware(p))
                .orJust(function () { return p; })
                .get();
        });
    };
    /**
     * routing installs all the routes of each module and creates a tree
     * out of express.
     */
    App.prototype.routing = function () {
        var _this = this;
        return future_1.attempt(function () { return record_1.map(_this.state.contexts, function (c) {
            if (c.module.isJust()) {
                var m_1 = c.module.get();
                var t = c.template;
                var routes = m_1.routes(m_1.module);
                if (t.app && t.app.filters) {
                    var filters_1 = t.app.filters;
                    m_1.module.install(routes.map(function (r) { return ({
                        method: r.method,
                        path: r.path,
                        filters: filters_1.concat(r.filters)
                    }); }));
                }
                else {
                    m_1.module.install(routes);
                }
                if (t.app && t.app.notFoundHandler)
                    m_1.app.use(t.app.notFoundHandler);
                if (t.app && t.app.errorHandler)
                    m_1.app.use(t.app.errorHandler);
                m_1.parent.map(function (p) { return p.app.use(path_1.join('/', m_1.path), m_1.app); });
            }
        }); })
            .map(function_1.cons(this));
    };
    /**
     * listen for incomming connections.
     */
    App.prototype.listen = function () {
        var _this = this;
        return context_1.getModule(this.state, this.main.id)
            .map(function (m) { return _this.server.listen(m.app); })
            .get();
    };
    /**
     * start the App.
     */
    App.prototype.start = function () {
        var _this = this;
        return this
            .spawnModule(this.main.id, maybe_1.nothing(), this.main)
            .initialize()
            .chain(function () { return _this.connections(); })
            .chain(function () { return _this.middlewares(); })
            .chain(function () { return _this.routing(); })
            .chain(function () { return startListening(_this); });
    };
    App.prototype.stop = function () {
        var _this = this;
        return this
            .server
            .stop()
            .chain(function () { return _this.pool.close(); })
            .map(function () {
            var t = new this_1.This('$', _this);
            t.exec(new scripts_3.StopScript(_this.main.id));
        })
            .map(function () {
            _this.state = newState(_this);
            _this.pool = new connection_1.Pool({});
        });
    };
    return App;
}(framework_1.AbstractSystem));
exports.App = App;
var getModuleAddress = function (parent, path) {
    return (parent.isJust()) ? path_1.join(parent.get().address, path) : path;
};
var initContext = function (a) { return function (c) {
    return c
        .module
        .chain(function (m) { return maybe_1.fromNullable(m.hooks.init); })
        .map(function (i) { return i(a); })
        .orJust(function () { return future_1.pure(function_1.noop()); })
        .get();
}; };
var mergeSpawnable = function (id, c) {
    return record_1.merge({
        id: id,
        create: function (s) {
            var _a;
            return new ((_a = c.constructor).bind.apply(_a, [void 0].concat(c.arguments.map(function (a) { return (a === '$') ? s : a; }))))();
        }
    }, c);
};
var dispatchConnected = function (a) { return function (c) {
    return c
        .module
        .chain(function (m) { return maybe_1.fromNullable(m.hooks.connected); })
        .map(function (c) { return c(a); })
        .orJust(function () { return future_1.pure(function_1.noop()); })
        .get();
}; };
var applyMware = function (app) { return function (m) {
    return m
        .middleware
        .enabled
        .reduce(swap(m), either_1.right([preroute(m)]))
        .map(function (list) { return m.app.use.apply(m.app, list); })
        .map(function () { return app; })
        .orRight(function (e) { return future_1.raise(e); })
        .takeRight();
}; };
var preroute = function (module) {
    return function (_, res, next) {
        return maybe_1.fromBoolean(module.disabled)
            .map(function () { return res.status(404).end(); })
            .orElse(function () { return module.redirect.map(function (r) { return res.redirect(r.status, r.location); }); })
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
var startListening = function (a) {
    var list = record_1.values(record_1.map(a.state.contexts, dispatchStart(a)));
    return future_1.parallel([a.listen().map(function () { })].concat(list))
        .map(function () { return a; });
};
var dispatchStart = function (a) { return function (c) {
    return c
        .module
        .chain(function (m) { return maybe_1.fromNullable(m.hooks.start); })
        .map(function (h) { return h(a); })
        .orJust(function () { return future_1.pure(function_1.noop()); })
        .get();
}; };
var newState = function (app) { return ({
    contexts: {
        $: newContext(maybe_1.nothing(), app, new this_1.This('$', app), {
            id: '$',
            create: function () { return new App(function () { return app.main; }); },
            trap: function (e) {
                if (e instanceof Error) {
                    throw e;
                }
                else {
                    throw new Error(e.message);
                }
            }
        })
    },
    routers: {},
    groups: {}
}); };
var newContext = function (module, actor, runtime, template) { return ({
    module: module,
    mailbox: maybe_1.nothing(),
    actor: actor,
    runtime: runtime,
    behaviour: [],
    flags: { immutable: true, buffered: false },
    template: template
}); };
//# sourceMappingURL=index.js.map