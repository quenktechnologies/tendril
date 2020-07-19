"use strict";
exports.__esModule = true;
exports.App = void 0;
var express = require("express");
var record_1 = require("@quenk/noni/lib/data/record");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var vm_1 = require("@quenk/potoo/lib/actor/system/vm");
var server_1 = require("../net/http/server");
var connection_1 = require("./connection");
var data_1 = require("./module/data");
var template_1 = require("./module/template");
var stage_1 = require("./boot/stage");
var init_1 = require("./boot/stage/init");
var connections_1 = require("./boot/stage/connections");
var log_1 = require("./boot/stage/log");
var session_1 = require("./boot/stage/session");
var csrf_token_1 = require("./boot/stage/csrf-token");
var cookie_parser_1 = require("./boot/stage/cookie-parser");
var body_parser_1 = require("./boot/stage/body-parser");
var middleware_1 = require("./boot/stage/middleware");
var routing_1 = require("./boot/stage/routing");
var listen_1 = require("./boot/stage/listen");
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
        this.stages = App.createDefaultStageBundle(this);
    }
    /**
     * create a new Application instance.
     */
    App.create = function (provider) {
        return new App(provider);
    };
    /**
     * createDefaultStageBundle produces a StageBundle
     */
    App.createDefaultStageBundle = function (app) {
        return new stage_1.StageBundle([
            new init_1.InitStage(app.hooks),
            new connections_1.ConnectionsStage(app.pool, app.modules, app.hooks),
            new log_1.LogStage(app.modules),
            new session_1.SessionStage(app.modules),
            new csrf_token_1.CSRFTokenStage(app.modules),
            new cookie_parser_1.CookieParserStage(app.modules),
            new body_parser_1.BodyParserStage(app.modules),
            new middleware_1.MiddlewareStage(app, app.modules),
            new routing_1.RoutingStage(app.modules),
            new listen_1.ListenStage(app.server, app.hooks, function () {
                return data_1.getModule(app.modules, mainPath(app.main.id));
            })
        ]);
    };
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
     * start the App.
     */
    App.prototype.start = function () {
        var _this = this;
        return this
            .spawnModule(mainPath(this.main.id), maybe_1.nothing(), this.main)
            .chain(function () { return _this.stages.execute(); })
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
