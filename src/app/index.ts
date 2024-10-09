import * as express from 'express';

import { Maybe, nothing } from '@quenk/noni/lib/data/maybe';
import { PVM } from '@quenk/potoo/lib/actor/system/vm';

import { Server } from '../net/http/server';
import { getInstance } from './connection';
import { Template } from './module/template';
import { ModuleData, getModule, ModuleDatas } from './module/data';
import {
    getAvailableMiddleware,
    getEnabledMiddleware,
    getRoutes,
    getShowFun,
    getServerConf,
    getConnections,
    getHooks
} from './module/template';
import { StageBundle } from './boot/stage';
import { InitStage } from './boot/stage/init';
import { ConnectionsStage } from './boot/stage/connections';
import { LogStage } from './boot/stage/log';
import { SessionStage } from './boot/stage/session';
import { CSRFTokenStage } from './boot/stage/csrf-token';
import { CookieParserStage } from './boot/stage/cookie-parser';
import { BodyParserStage } from './boot/stage/body-parser';
import { MiddlewareStage } from './boot/stage/middleware';
import { RoutingStage } from './boot/stage/routing';
import { StaticStage } from './boot/stage/static';
import { ListenStage } from './boot/stage/listen';
import { Dispatcher } from './hooks';
import { Module } from './module';

const defaultServConf = { port: 2407, host: '0.0.0.0' };

const dconf = { log: { level: 'error' } };

/**
 * App is the main entry point to the framework.
 *
 * App makes an actor system available to all its modules via the potoo
 * framework. This allows module code to communicate with each other when
 * needed to trigger effects that may not rely on http requests.
 *
 * Module code includes the routes declared for a module but also its services,
 * handlers and whatever logic configureed to be executed.
 */
export class App {
    constructor(public provider: (s: App) => Template) {}

    main = <Template>this.provider(this);

    vm: PVM = PVM.create((this.main.app && this.main.app.system) || dconf);

    modules = <ModuleDatas>{};

    server = new Server(getServerConf(this.main, defaultServConf));

    pool = getInstance();

    hooks = <Dispatcher<this>>new Dispatcher(this);

    stages = App.createDefaultStageBundle(this);

    /**
     * create a new Application instance.
     */
    static create(provider: (s: App) => Template): App {
        return new App(provider);
    }

    /**
     * createDefaultStageBundle produces a StageBundle
     */
    static createDefaultStageBundle(app: App): StageBundle {
        let provideMain = () =>
            getModule(app.modules, mainPath(app.main.id)).get();

        return new StageBundle([
            new InitStage(app.hooks),
            new ConnectionsStage(app.pool, app.modules, app.hooks),
            new LogStage(app.modules),
            new SessionStage(app.modules, app.pool),
            new CookieParserStage(app.modules),
            new BodyParserStage(app.modules),
            new CSRFTokenStage(app.modules),
            new MiddlewareStage(app, app.modules),
            new RoutingStage(app.modules),
            new StaticStage(provideMain, app.modules),
            new ListenStage(app.server, app.hooks, provideMain, app)
        ]);
    }

    getPlatform() {
        return this.vm;
    }

    registerModule(parent: Maybe<ModuleData>, module: Module) {
        let { self: address, template } = module;

        let mctx: ModuleData = {
            path: module.path,
            address,
            parent,
            app: express(),
            module,
            hooks: getHooks(template),
            template: module.template,
            middleware: {
                enabled: getEnabledMiddleware(template),
                available: getAvailableMiddleware(template)
            },
            routes: getRoutes(template),
            show: getShowFun(template, parent),
            connections: getConnections(template),
            disabled: template.disabled || false,
            redirect: nothing()
        };

        this.modules[address] = mctx;

        return mctx;
    }

    /**
     * installMiddleware at the specified mount point.
     *
     * If no module exists there, the attempt will be ignored.
     */
    installMiddleware(path: string, handler: express.RequestHandler): App {
        return getModule(this.modules, path)
            .map(m => m.app.use(handler))
            .map(() => this)
            .orJust(() => this)
            .get();
    }

    async start() {
        await this.vm.spawn({
            ...this.main,
            spawnConcern: 'receiving',
            create: runtime =>
                this.registerModule(
                    Maybe.nothing(),
                    new Module(this, runtime, mainPath(this.main.id), this.main)
                ).module
        });
        await this.stages.execute();
    }

    async stop() {
        await this.server.stop();
        await this.pool.close();
        await this.vm.stop();
    }
}

const mainPath = (path?: string): string => (path != null ? path : '/');
