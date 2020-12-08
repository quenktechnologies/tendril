"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express = require("express");
const record_1 = require("@quenk/noni/lib/data/record");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const vm_1 = require("@quenk/potoo/lib/actor/system/vm");
const server_1 = require("../net/http/server");
const connection_1 = require("./connection");
const data_1 = require("./module/data");
const template_1 = require("./module/template");
const stage_1 = require("./boot/stage");
const init_1 = require("./boot/stage/init");
const connections_1 = require("./boot/stage/connections");
const log_1 = require("./boot/stage/log");
const session_1 = require("./boot/stage/session");
const csrf_token_1 = require("./boot/stage/csrf-token");
const cookie_parser_1 = require("./boot/stage/cookie-parser");
const body_parser_1 = require("./boot/stage/body-parser");
const middleware_1 = require("./boot/stage/middleware");
const routing_1 = require("./boot/stage/routing");
const static_1 = require("./boot/stage/static");
const listen_1 = require("./boot/stage/listen");
const hooks_1 = require("./hooks");
const defaultServConf = { port: 2407, host: '0.0.0.0' };
const dconf = { log: { level: 3 } };
/**
 * App is the main entry point to the framework.
 *
 * An App serves as an actor system for all the modules of the application.
 * It configures routing of requests for each module and makes whatever services
 * the user desires available via child actors.
 */
class App {
    constructor(provider) {
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
    static create(provider) {
        return new App(provider);
    }
    /**
     * createDefaultStageBundle produces a StageBundle
     */
    static createDefaultStageBundle(app) {
        let provideMain = () => data_1.getModule(app.modules, mainPath(app.main.id)).get();
        return new stage_1.StageBundle([
            new init_1.InitStage(app.hooks),
            new connections_1.ConnectionsStage(app.pool, app.modules, app.hooks),
            new log_1.LogStage(app.modules),
            new session_1.SessionStage(app.modules, app.pool),
            new cookie_parser_1.CookieParserStage(app.modules),
            new body_parser_1.BodyParserStage(app.modules),
            new csrf_token_1.CSRFTokenStage(app.modules),
            new middleware_1.MiddlewareStage(app, app.modules),
            new routing_1.RoutingStage(app.modules),
            new static_1.StaticStage(provideMain, app.modules),
            new listen_1.ListenStage(app.server, app.hooks, provideMain)
        ]);
    }
    exec(i, s) {
        return this.vm.exec(i, s);
    }
    execNow(i, s) {
        return this.vm.execNow(i, s);
    }
    /**
     * spawn a regular actor from a template.
     *
     * This actor must use the same Context type as the App.
     */
    spawn(tmpl) {
        this.vm.spawn(tmpl);
        return this;
    }
    /**
     * spawnModule (not a generic actor) from a template.
     *
     * A module must have a parent unless it is the root module of the app.
     */
    spawnModule(path, parent, tmpl) {
        let module = tmpl.create(this, tmpl);
        let t = record_1.merge(tmpl, { create: () => module });
        let address = parent.isNothing() ?
            this.vm.spawn(t) :
            parent.get().module.spawn(t);
        let app = express();
        let mctx = {
            path,
            address,
            parent,
            app,
            module,
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
            let mmctx = maybe_1.just(mctx);
            return future_1.sequential(record_1.mapTo(t.app.modules, (c, k) => this.spawnModule(k, mmctx, c(this))))
                .chain(() => future_1.pure(address));
        }
        else {
            return future_1.pure(address);
        }
    }
    /**
     * installMiddleware at the specified mount point.
     *
     * If no module exists there, the attempt will be ignored.
     */
    installMiddleware(path, handler) {
        return data_1.getModule(this.modules, path)
            .map(m => m.app.use(handler))
            .map(() => this)
            .orJust(() => this)
            .get();
    }
    /**
     * start the App.
     */
    start() {
        return this
            .spawnModule(mainPath(this.main.id), maybe_1.nothing(), this.main)
            .chain(() => this.stages.execute())
            .map(() => this);
    }
    stop() {
        return this
            .server
            .stop()
            .chain(() => this.pool.close())
            .chain(() => this.vm.stop());
    }
}
exports.App = App;
const mainPath = (path) => (path != null) ? path : '/';
//# sourceMappingURL=index.js.map