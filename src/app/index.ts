import * as express from 'express';

import { Record } from '@quenk/noni/lib/data/record';

import { PVM } from '@quenk/potoo/lib/actor/system/vm';

import { Server } from '../net/http/server';
import { ModuleConf } from './module/conf';
import { getInstance } from './connection';
import { Module, ModuleInfo } from './module';
import { StartupTaskManager } from './startup';
import { EventDispatcher } from './events';
import { getParent } from '@quenk/potoo/lib/actor/address';

const defaultServConf = { port: 2407, host: '0.0.0.0' };

const dconf = { log: { level: 'error' } };

export type ModuleConfProvider = (app: App) => ModuleConf;

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
    constructor(
        public main: ModuleConf,
        public vm: PVM = PVM.create((main.app && main.app.vm) || dconf),
        public modules: Record<ModuleInfo> = {},
        public pool = getInstance(),
        public server = new Server(main.app?.server ?? defaultServConf),
        public startup = new StartupTaskManager([], modules),
        public events = new EventDispatcher()
    ) {}

    /**
     * createDefaultStageBundle produces a StageBundle
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
            new BuildRoutingStage(app.modules),
            new CSRFTokenStage(app.modules),
            new MiddlewareStage(app, app.modules),
            new RoutingStage(app.modules),
            new StaticStage(provideMain, app.modules),
            new ListenStage(app.server, app.hooks, provideMain, app)
        ]);
    }
     */

    registerModule(module: Module) {
        let parent = this.modules[getParent(module.address)];
        let conf = module.conf;
        this.modules[module.address] = {
            path:conf?.app?.path ?? conf.id ?? '/',
            address: module.address,
            conf,
            parent,
            express: express(),
            module,
            routing: {
                middleware: { available: new Map(), enabled: [] },
                globalFilters: [],
                handlers: {},
                routes: []
            },
            connections: {}
        };

        return module;
    }

    async start() {
        await this.vm.spawn({
            ...this.main,
            spawnConcern: 'receiving',
            create: runtime =>
                this.registerModule(
                    new Module(this, runtime, this.main)
                )
        });

        await this.startup.run();
    }

    async stop() {
        await this.server.stop();
        await this.pool.close();
        await this.vm.stop();
    }
}
