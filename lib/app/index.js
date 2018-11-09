"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var record_1 = require("@quenk/noni/lib/data/record");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var either_1 = require("@quenk/noni/lib/data/either");
var function_1 = require("@quenk/noni/lib/data/function");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var state_1 = require("@quenk/potoo/lib/actor/system/state");
var drop_1 = require("@quenk/potoo/lib/actor/system/op/drop");
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
        this.main = main;
        this.configuration = configuration;
        this.state = { contexts: {}, routes: {} };
        this.stack = [];
        this.running = false;
        this.express = express();
        this.server = new server_1.Server(defaultServerConf(this.main.server));
        this.pool = new connection_1.Pool({});
        this.middleware = {};
        this.paths = [];
    }
    App.prototype.initialize = function () {
        return future_1.parallel(record_1.values(record_1.map(this.state.contexts, initContext))).map(function_1.cons(this));
    };
    App.prototype.connections = function () {
        var _this = this;
        return this
            .pool
            .open()
            .chain(function () { return future_1.parallel(record_1.values(record_1.map(_this.state.contexts, connectedFrame))); })
            .map(function_1.cons(this));
    };
    App.prototype.middlewares = function () {
        var _this = this;
        record_1.map(this.state.contexts, function (f) {
            return f.module.map(function (m) { return installMiddleware(_this, m); });
        });
        return future_1.pure(this);
    };
    App.prototype.routing = function () {
        var _this = this;
        return future_1.attempt(function () { return record_1.map(_this.state.contexts, function (f) {
            return f.module.map(function (m) { return m.routes(m.module, m.app); });
        }); }).map(function_1.cons(this));
    };
    App.prototype.linking = function () {
        var _this = this;
        record_1.map(this.state.contexts, function (pc, k) {
            return record_1.map(state_1.getChildren(_this.state, k), function (c, path) {
                return pc.module.chain(function (m) { return c.module.map(function (cm) { return m.app.use(path, cm.app); }); });
            });
        });
        state_1.get(this.state, this.paths[0])
            .chain(function (c) { return c.module; })
            .map(function (m) { return _this.express.use(m.app); });
        return future_1.pure(this);
    };
    App.prototype.spawn = function (path, tmpl) {
        var _this = this;
        var actor = tmpl.create(this);
        var mctx = {
            path: path,
            module: actor,
            app: express(),
            hooks: defaultHooks(tmpl),
            middleware: defaultEnabledMiddleware(tmpl),
            routes: defaultRoutes(tmpl),
            show: defaultShow(tmpl, path, this)
        };
        record_1.map(defaultConnections(tmpl), function (c, k) { return _this.pool.add(k, c); });
        this.paths.push(path);
        this.middleware = record_1.merge(this.middleware, defaultMiddlware(tmpl));
        state_1.put(this.state, path, context_1.newContext(maybe_1.just(mctx), actor, tmpl));
        if (tmpl.app && tmpl.app.modules)
            record_1.map(tmpl.app.modules, function (m, k) {
                return _this.spawn("" + path + (path === '/' ? '' : '/') + k, m);
            });
        return this;
    };
    App.prototype.allocate = function (t) {
        var actor = t.create(this);
        return actor.init(context_1.newContext(maybe_1.nothing(), actor, t));
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
        var _a = this.configuration.log, level = _a.level, logger = _a.logger;
        if (this.running)
            return;
        this.running = true;
        while (this.stack.length > 0)
            op_1.log(level || 0, logger || console, this.stack.pop()).exec(this);
        this.running = false;
    };
    App.prototype.start = function () {
        var _this = this;
        return this
            .spawn(this.main.id, this.main)
            .initialize()
            .chain(function () { return _this.connections(); })
            .chain(function () { return _this.middlewares(); })
            .chain(function () { return _this.routing(); })
            .chain(function () { return _this.linking(); })
            .chain(function () { return _this.server.listen(_this.express); })
            .map(function_1.cons(this));
    };
    App.prototype.stop = function () {
        //@todo stop child actors
        var _this = this;
        return this
            .server
            .stop()
            .chain(function () { return _this.pool.close(); })
            .map(function () {
            _this.stack = [];
            _this.state = { contexts: {}, routes: {} };
            _this.running = false;
            _this.express = express();
            _this.pool = new connection_1.Pool({});
            _this.middleware = {};
            _this.paths = [];
        });
    };
    return App;
}());
exports.App = App;
var defaultServerConf = function (conf) {
    return record_1.merge({ port: 2407, host: '0.0.0.0' }, (conf == null) ? {} : conf);
};
var defaultHooks = function (t) { return (t.app && t.app.on) ?
    t.app.on : {}; };
var defaultConnections = function (t) { return t.connections ?
    record_1.map(t.connections, function (c) { return c.options ?
        c.connector.apply(null, c.options || []) :
        c.connector; }) : {}; };
var defaultMiddlware = function (t) {
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
var defaultShow = function (t, path, app) {
    return (t.app && t.app.views) ?
        maybe_1.just(t.app.views.provider.apply(null, t.app.views.options || [])) : (state_1.getParent(app.state, path)
        .chain(function (f) { return f.module; })
        .chain(function (m) { return m.show; }));
};
var initContext = function (f) {
    return f
        .module
        .chain(function (m) { return maybe_1.fromNullable(m.hooks.init); })
        .map(function (i) { return i(); })
        .orJust(function () { return future_1.pure(function_1.noop()); })
        .get();
};
var connectedFrame = function (f) {
    return f
        .module
        .chain(function (m) { return maybe_1.fromNullable(m.hooks.connected); })
        .map(function (c) { return c(); })
        .orJust(function () { return future_1.pure(function_1.noop()); })
        .get();
};
var installMiddleware = function (app, m) {
    return m
        .middleware
        .reduce(verifyMiddleware(app), either_1.right([]))
        .map(function (list) { return (list.length > 0) ?
        m.app.use.apply(m.app, list) :
        either_1.right(function_1.noop()); })
        .map(function_1.noop);
};
var verifyMiddleware = function (app) { return function (p, c) {
    return p.chain(verifyMiddleware_(c, app.middleware));
}; };
var verifyMiddleware_ = function (curr, wares) { return function (list) {
    return wares.hasOwnProperty(curr) ?
        either_1.right(list.concat(wares[curr])) :
        either_1.left(new Error("Unknown wares \"" + curr + "\"!"));
}; };
//# sourceMappingURL=index.js.map