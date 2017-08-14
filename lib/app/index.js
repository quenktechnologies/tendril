"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var Bluebird = require("bluebird");
var express = require("express");
var data = require("../data");
var util_1 = require("afpl/lib/util");
var server_1 = require("../server");
var DefaultRenderer = (function () {
    function DefaultRenderer(name) {
        this.name = name;
    }
    DefaultRenderer.prototype.render = function () {
        return Bluebird.reject(new Error("No view engine configured for module '" + this.name + "'"));
    };
    return DefaultRenderer;
}());
exports.DefaultRenderer = DefaultRenderer;
/**
 * Module
 */
var Module = (function () {
    function Module(name, configuration, routeFn) {
        this.name = name;
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
    Module.prototype.onError = function (e, req, res) {
        var t = this.configuration.tendril;
        if (t && t.app && t.app.errors && t.app.errors.handler)
            return t.app.errors.handler(e, req, res, this);
    };
    Module.prototype.submodules = function () {
        var _this = this;
        var t = this.configuration.tendril;
        return (t && t.app && t.app.modules) ?
            this._modules
                .push
                .apply(util_1.map(t.app.modules, function (f, k) { return _this._modules.push(f(k)); }))
            : Bluebird
                .reduce(this._modules, function (_, m) { return m.submodules(); })
                .then(function () { return Bluebird.resolve(); });
    };
    Module.prototype.connections = function () {
        var _this = this;
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
        return p
            .then(function () { return Bluebird
            .reduce(_this._modules, function (_, m) { return m.connections(); })
            .then(function () { return Bluebird.resolve(); }); });
    };
    Module.prototype.middleware = function () {
        var _this = this;
        var t = this.configuration.tendril;
        var eapp = this._app;
        var p;
        if (t && t.app && t.app.filters && t.app.filters.enabled) {
            p = Bluebird.reduce(t.app.filters.enabled, function (_, name) {
                var available = t.app.filters.available;
                return (available && available[name]) ?
                    Bluebird.try(function () {
                        return eapp.use(available[name].options ?
                            available[name].module(available[name].options) :
                            available[name].module());
                    }) :
                    Bluebird.reject(new Error("Unknown filter '" + name + "' in module '" + _this.name + "'!"));
            });
        }
        else {
            p = Bluebird.resolve();
        }
        return p.then(function () { return Bluebird
            .reduce(_this._modules, function (_, m) { return m.middleware(); })
            .then(function () { return Bluebird.resolve(); }); });
    };
    Module.prototype.routes = function () {
        var _this = this;
        return Bluebird.try(function () { return _this.routeFn(_this._app, _this._renderer, _this); })
            .then(function () { return Bluebird.reduce(_this._modules, function (_, m) { return m.routes(); }); });
    };
    Module.prototype.views = function () {
        var _this = this;
        var t = this.configuration.tendril;
        return ((t && t.app && t.app.views && t.app.views.engine) ?
            t.app.views.engine.module(t.app.views.engine.options)
                .then(function (r) { _this._renderer = r; }) :
            Bluebird.resolve())
            .then(function () { return Bluebird.reduce(_this._modules, function (_, m) { return m.views(); }); });
    };
    Module.prototype.link = function (app) {
        var _this = this;
        return Bluebird.reduce(this._modules, function (_, m) { return m.link(_this._app); })
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
var defaults = {
    port: 2407,
    host: '0.0.0.0'
};
/**
 * Application is the main class of the framework.
 */
var Application = (function () {
    function Application(main) {
        this.main = main;
        this.express = express();
    }
    Application.prototype.start = function () {
        var _this = this;
        return this.main.init(this)
            .then(function () {
            var opts = Object.assign({}, defaults, _this.main.getConf().tendril.server);
            _this.server = new server_1.ManagedServer(opts.port, opts.host, http.createServer(_this.main.getExpressApp()));
            return _this.server.start();
        })
            .then(function () { return _this; });
    };
    return Application;
}());
exports.Application = Application;
//# sourceMappingURL=index.js.map