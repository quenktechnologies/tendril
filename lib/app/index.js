"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path_1 = require("path");
var record_1 = require("@quenk/noni/lib/data/record");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var either_1 = require("@quenk/noni/lib/data/either");
var function_1 = require("@quenk/noni/lib/data/function");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var state_1 = require("@quenk/potoo/lib/actor/system/state");
var drop_1 = require("@quenk/potoo/lib/actor/system/op/drop");
var tell_1 = require("@quenk/potoo/lib/actor/system/op/tell");
var spawn_1 = require("@quenk/potoo/lib/actor/system/op/spawn");
var kill_1 = require("@quenk/potoo/lib/actor/system/op/kill");
var address_1 = require("@quenk/potoo/lib/actor/address");
var op_1 = require("@quenk/potoo/lib/actor/system/op");
var server_1 = require("../net/http/server");
var connection_1 = require("./connection");
var context_1 = require("./state/context");
/**
 * App is the main class of the framework.
 *
 * This class functions as an actor system and your
 * application.
 */
var App = /** @class */ (function () {
    function App(main, configuration) {
        if (configuration === void 0) { configuration = {}; }
        this.main = main;
        this.configuration = configuration;
        this.state = newState(this);
        this.stack = [];
        this.running = false;
        this.server = new server_1.Server(defaultServerConf(this.main.server));
        this.pool = new connection_1.Pool({});
    }
    App.prototype.allocate = function (t) {
        var actor = t.create(this);
        return actor.init(newContext(maybe_1.nothing(), actor, t));
    };
    App.prototype.init = function (c) {
        return c;
    };
    App.prototype.identify = function (actor) {
        return state_1.getAddress(this.state, actor)
            .orJust(function () { return address_1.ADDRESS_DISCARD; })
            .get();
    };
    App.prototype.exec = function (code) {
        this.stack.push(code);
        this.run();
        return this;
    };
    App.prototype.accept = function (_a) {
        var to = _a.to, from = _a.from, message = _a.message;
        return this.exec(new drop_1.Drop(to, from, message));
    };
    App.prototype.run = function () {
        var policy = (this.configuration.log || {});
        if (this.running)
            return;
        this.running = true;
        while (this.stack.length > 0)
            op_1.log(policy.level || 1, policy.logger || console, this.stack.pop()).exec(this);
        this.running = false;
    };
    App.prototype.spawn = function (path, parent, tmpl) {
        var _this = this;
        var module = tmpl.create(this);
        var app = express();
        var address = defaultAddress(path, parent);
        var mctx = {
            path: path,
            address: address,
            parent: parent,
            module: module,
            app: app,
            hooks: defaultHooks(tmpl),
            middleware: {
                enabled: defaultEnabledMiddleware(tmpl),
                available: defaultAvailableMiddleware(tmpl)
            },
            routes: defaultRoutes(tmpl),
            show: defaultShow(tmpl, parent),
            connections: defaultConnections(tmpl),
            disabled: tmpl.disabled || false,
            redirect: maybe_1.nothing()
        };
        state_1.put(this.state, address, module.init(newContext(maybe_1.just(mctx), module, tmpl)));
        if (tmpl.app && tmpl.app.modules)
            record_1.map(tmpl.app.modules, function (m, k) { return _this.spawn(k, maybe_1.just(mctx), m); });
        if (Array.isArray(tmpl.children))
            tmpl.children.forEach(function (c) { return _this.exec(new spawn_1.Spawn(module, c)); });
        return this;
    };
    /**
     * tell a message to an actor in the system.
     */
    App.prototype.tell = function (to, msg) {
        return this.exec(new tell_1.Tell(to, '$', msg));
    };
    /**
     * initialize the App
     *
     * Invokes the init hooks of all modules.
     */
    App.prototype.initialize = function () {
        return future_1.parallel(record_1.values(record_1.map(this.state.contexts, initContext))).map(function_1.cons(this));
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
            .chain(function () { return future_1.parallel(record_1.values(record_1.map(_this.state.contexts, dispatchConnected))); })
            .map(function_1.cons(this));
    };
    /**
     * middlewares installs the middleware each module declares.
     */
    App.prototype.middlewares = function () {
        return record_1.reduce(this.state.contexts, future_1.pure(this), function (p, c) {
            return c
                .module
                .map(function (m) {
                return getMwares(m)
                    .map(function (list) { return m.app.use.apply(m.app, list); })
                    .orRight(function (e) { return future_1.raise(e); })
                    .takeRight();
            })
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
            return c
                .module
                .map(function (m) {
                m.routes(m.module);
                m.parent.map(function (p) { return p.app.use(path_1.join('/', m.path), m.app); });
            });
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
            .spawn(this.main.id, maybe_1.nothing(), this.main)
            .initialize()
            .chain(function () { return _this.connections(); })
            .chain(function () { return _this.middlewares(); })
            .chain(function () { return _this.routing(); })
            .chain(function () { return _this.listen(); })
            .map(function_1.cons(this));
    };
    App.prototype.stop = function () {
        var _this = this;
        return this
            .server
            .stop()
            .chain(function () { return _this.pool.close(); })
            .map(function () {
            return state_1.getInstance(_this.state, _this.main.id)
                .map(function (actor) { return _this.exec(new kill_1.Kill(actor, _this.main.id)); });
        })
            .map(function () {
            _this.stack = [];
            _this.state = { contexts: {}, routes: {} };
            _this.running = false;
            _this.pool = new connection_1.Pool({});
        });
    };
    return App;
}());
exports.App = App;
var defaultServerConf = function (conf) {
    return record_1.merge({ port: 2407, host: '0.0.0.0' }, (conf == null) ? {} : conf);
};
var defaultAddress = function (path, parent) {
    return parent
        .map(function (m) { return m.address; })
        .map(function (a) { return path_1.join(a, path); })
        .orJust(function () { return path; })
        .get();
};
var defaultHooks = function (t) { return (t.app && t.app.on) ?
    t.app.on : {}; };
var defaultConnections = function (t) { return t.connections ?
    record_1.map(t.connections, function (c) { return c.options ?
        c.connector.apply(null, c.options || []) :
        c.connector; }) : {}; };
var defaultAvailableMiddleware = function (t) {
    return (t.app && t.app.middleware && t.app.middleware.available) ?
        record_1.map(t.app.middleware.available, function (m) {
            return m.provider.apply(null, m.options || []);
        }) : {};
};
var defaultEnabledMiddleware = function (t) {
    return (t.app && t.app.middleware && t.app.middleware.enabled) ?
        t.app.middleware.enabled : [];
};
var defaultRoutes = function (t) {
    return (t.app && t.app.routes) ? t.app.routes : function_1.noop;
};
var defaultShow = function (t, parent) {
    return (t.app && t.app.views) ?
        maybe_1.just(t.app.views.provider.apply(null, t.app.views.options || [])) :
        parent.chain(function (m) { return m.show; });
};
var initContext = function (f) {
    return f
        .module
        .chain(function (m) { return maybe_1.fromNullable(m.hooks.init); })
        .map(function (i) { return i(); })
        .orJust(function () { return future_1.pure(function_1.noop()); })
        .get();
};
var dispatchConnected = function (f) {
    return f
        .module
        .chain(function (m) { return maybe_1.fromNullable(m.hooks.connected); })
        .map(function (c) { return c(); })
        .orJust(function () { return future_1.pure(function_1.noop()); })
        .get();
};
var getMwares = function (m) {
    return m
        .middleware
        .enabled
        .reduce(swap(m), either_1.right([preroute(m)]));
};
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
var newState = function (app) { return ({
    contexts: {
        $: newContext(maybe_1.nothing(), app, { id: '$', create: function () { return new App(app.main); } })
    },
    routes: {}
}); };
var newContext = function (module, actor, template) { return ({
    module: module,
    mailbox: maybe_1.nothing(),
    actor: actor,
    behaviour: [],
    flags: { immutable: true, buffered: false },
    template: template
}); };
//# sourceMappingURL=index.js.map