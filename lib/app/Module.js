"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Bluebird = require("bluebird");
var express = require("express");
var data = require("../data");
var util_1 = require("afpl/lib/util");
/**
 * Module
 */
var Module = (function () {
    function Module(name, path, configuration, routeFn) {
        this.name = name;
        this.path = path;
        this.configuration = configuration;
        this.routeFn = routeFn;
        this._modules = [];
        this._app = express();
    }
    Module.prototype.getApp = function () {
        return this._application;
    };
    Module.prototype.getExpressApp = function () {
        return this._app;
    };
    Module.prototype.getConf = function () {
        return this.configuration;
    };
    Module.prototype.onError = function (e) {
        var t = this.configuration.tendril;
        if (t && t.app && t.app.errors && t.app.errors.handler)
            return t.app.errors.handler(e, this);
        console.error(this.name + ": error occured!");
        console.error(e.stack ? e.stack : e);
        process.exit(-1);
    };
    Module.prototype.render = function (view, context) {
        return (this._renderer) ?
            this._renderer.render(view, context) :
            Bluebird.reject(new Error("No renderer configured for module '" + this.name + "'!"));
    };
    Module.prototype.submodules = function () {
        var _this = this;
        var t = this.configuration.tendril;
        if (t && t.app && t.app.modules)
            this._modules.push.apply(util_1.map(t.app.modules, function (f, k) { return _this._modules.push(f(k)); }));
        return this._modules.reduce(function (p, m) { return p.then(function () { return m.submodules(); }); }, Bluebird.resolve());
    };
    Module.prototype.initScripts = function () {
        var t = this.configuration.tendril;
        var p = (t && t.app.on && t.app.on.init) ?
            t.app.on.init(this) :
            Bluebird.resolve();
        return this._modules.reduce(function (p, m) { return p.then(function () { return m.initScripts(); }); }, p);
    };
    Module.prototype.connections = function () {
        var t = this.configuration.tendril;
        var p;
        if (t && t.data && t.data.connections) {
            p = Bluebird
                .all(util_1.map(t.data.connections, function (c, k) {
                return c.connector(c.options).then(function (c) { data.Pool.add(k, c); });
            }));
        }
        else {
            p = Bluebird.resolve();
        }
        return this
            ._modules
            .reduce(function (p, m) { return p.then(function () { return m.connections(); }); }, p)
            .then(function () { return Bluebird.resolve(); });
    };
    Module.prototype.middleware = function () {
        var _this = this;
        var t = this.configuration.tendril;
        var eapp = this._app;
        var p;
        if (t && t.app && t.app.middleware && t.app.middleware.enabled) {
            p = Bluebird.reduce(t.app.middleware.enabled, function (_, name) {
                var available = t.app.middleware.available;
                return (available && available[name]) ?
                    Bluebird.try(function () {
                        return eapp.use(available[name].options ?
                            available[name].module(available[name].options) :
                            available[name].module());
                    }) :
                    Bluebird.reject(new Error("Unknown filter '" + name + "' in module '" + _this.name + "'!"));
            }, null);
        }
        else {
            p = Bluebird.resolve();
        }
        return this._modules.reduce(function (p, m) { return p.then(function () { return m.middleware(); }); }, p);
    };
    Module.prototype.routes = function () {
        var _this = this;
        return Bluebird.try(function () { return _this.routeFn(_this._app, _this); })
            .then(function () {
            return _this
                ._modules
                .reduce(function (p, m) { return p.then(function () { return m.routes(); }); }, Bluebird.resolve());
        });
    };
    Module.prototype.views = function () {
        var _this = this;
        var t = this.configuration.tendril;
        return ((t && t.app && t.app.views && t.app.views.engine) ?
            t.app.views.engine.module(t.app.views.engine.options, this)
                .then(function (r) { _this._renderer = r; }) :
            Bluebird.resolve())
            .then(function () {
            return _this
                ._modules
                .reduce(function (p, m) { return p.then(function () { return m.views(); }); }, Bluebird.resolve());
        });
    };
    Module.prototype.link = function (app) {
        var _this = this;
        return this._modules.reduce(function (p, m) { return p.then(function () { return m.link(_this._app); }); }, Bluebird.resolve())
            .then(function () { app.use("/" + _this.name, _this._app); });
    };
    /**
      * init this module
      */
    Module.prototype.init = function (a) {
        var _this = this;
        this._application = a;
        return this
            .submodules()
            .then(function () { return _this.initScripts(); })
            .then(function () { return _this.connections(); })
            .then(function () { return _this.middleware(); })
            .then(function () { return _this.routes(); })
            .then(function () { return _this.views(); })
            .then(function () { return _this.link(express()); })
            .then(function () { return _this; });
    };
    return Module;
}());
exports.Module = Module;
//# sourceMappingURL=Module.js.map