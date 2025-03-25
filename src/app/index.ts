import * as express from 'express';

import { Record } from '@quenk/noni/lib/data/record';
import { Maybe } from '@quenk/noni/lib/data/maybe';

import { PVM } from '@quenk/potoo/lib/actor/system/vm';
import { getParent } from '@quenk/potoo/lib/actor/address';
import { SPAWN_CONCERN_STARTED } from '@quenk/potoo/lib/actor/template';
import { LogSink } from '@quenk/potoo/lib/actor/system/vm/log';

import { Server } from '../net/http/server';
import { ModuleConf } from './module/conf';
import { Pool } from './connection/pool';
import { Module, ModuleInfo } from './module';
import { StartupManager } from './startup';
import {
    ConnectedEvent,
    EventDispatcher,
    InitEvent,
    StartedEvent
} from './events';
import { ConfigureEventListeners } from './startup/events';
import { PoolConnections } from './startup/connections';
import { ConfigureRequestLogger } from './startup/log';
import { SessionSupport } from './startup/session';
import { CookieSupport } from './startup/cookie';
import { ConfigureBodyParser } from './startup/body-parser';
import {
    BuildAvailableMiddleware,
    BuildEnabledMiddleware,
    BuildGlobalFilters,
    BuildRouteFilters,
    ConfigureFinalRoutes,
    ConfigureRoutes
} from './startup/routing';
import { CSRFTokenSupport } from './startup/csrf';
import { StaticDirSupport } from './startup/static';

const defaultServConf = { port: 2407, host: '0.0.0.0' };

const dconf = { log: { level: 'error' } };

export const defaultStartupTasks = (app: App) => [
    new ConfigureEventListeners(app),
    new PoolConnections(app),
    new ConfigureRequestLogger(app),
    new SessionSupport(app),
    new CookieSupport(app),
    new ConfigureBodyParser(app),
    new BuildGlobalFilters(app),
    new BuildRouteFilters(app),
    new BuildAvailableMiddleware(app),
    new BuildEnabledMiddleware(app),
    new CSRFTokenSupport(app),
    new StaticDirSupport(app),
    new ConfigureRoutes(app),
    new ConfigureFinalRoutes(app)
];

/**
 * App is the main class of the tendril framework.
 *
 * An App is a collection of one or more modules each of which in turn are
 * configured to handle specific incoming requests via routes. Routes are
 * handled by spawning a child actor (in the same process) that can communicate
 * with other actors in the app via the PVM apis.
 *
 * Modules are configurable and hierarchical with the first one serving as the
 * root. Most of the App configuration should be done there as many directives
 * are either inherited by children or do not have a productive effect.
 *
 * When an App is started, it will spawn the root module and all its children,
 * it will also execute a series of startup tasks that prepare the modules for
 * routing requests. These tasks are also responsible for opening connections
 * to resources and configuring the underlying framework.
 *
 * At this time tasks are meant to be an internal API and not configurable
 * in userland. This may change if a need arises for plugins etc.
 */
export class App {
    constructor(
        public conf: ModuleConf,
        public vm: PVM = PVM.create((conf.app && conf.app.vm) || dconf),
        public modules: Record<ModuleInfo> = {},
        public rootInfo: Maybe<ModuleInfo> = Maybe.nothing(),
        public pool = Pool,
        public server = new Server(conf.app?.server ?? defaultServConf),
        public events = new EventDispatcher(),
        public startup = new StartupManager(defaultStartupTasks),
        public log: LogSink = console
    ) {}

    /**
     * registerModule creates internal tracking information for newly created
     * modules.
     */
    registerModule(module: Module): ModuleInfo {
        let parent = this.modules[getParent(module.address)];
        let conf = module.conf;
        let info = {
            counts: counter++,
            path: conf?.app?.path ?? conf.id ?? '/',
            address: module.address,
            conf,
            parent,
            ancestors: parent ? [...parent.ancestors, parent] : [],
            express: express(),
            module,
            routing: {
                middleware: { available: new Map(), enabled: [] },
                globalFilters: [],
                handlers: {},
                routes: [],
                dirs: {}
            },
            connections: {}
        };

        this.modules[module.address] = info;
        this.log.debug(`[system]: Registered module "${module.address}"`);

        return info;
    }

    /**
     * start the App.
     */
    async start() {
        await this.vm.spawn({
            ...this.conf,
            spawnConcern: SPAWN_CONCERN_STARTED,
            create: runtime => {
                let root = this.registerModule(
                    new Module(this, runtime, this.conf)
                );
                this.rootInfo = Maybe.just(root);
                return root.module;
            }
        });

        await this.startup.run(this);

        await this.events.dispatch(new InitEvent());

        await this.pool.open();

        await this.events.dispatch(new ConnectedEvent());

        await Promise.allSettled([
            this.server.listen(this.rootInfo.get().express),
            this.events.dispatch(new StartedEvent())
        ]);
    }

    /**
     * stop the App
     *
     * Note: At this time, a stopped App should be considered in an invalid
     * state and not started again. This may change in a future version.
     */
    async stop() {
        await this.server.stop();
        await this.pool.close();
        await this.vm.stop();
    }
}

let counter = 0;
