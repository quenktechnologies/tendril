import * as express from 'express';

import { Record } from '@quenk/noni/lib/data/record';
import { Maybe } from '@quenk/noni/lib/data/maybe';

import { PVM } from '@quenk/potoo/lib/actor/system/vm';
import { getParent } from '@quenk/potoo/lib/actor/address';

import { Server } from '../net/http/server';
import { ModuleConf } from './module/conf';
import { getInstance } from './connection';
import { Module, ModuleInfo } from './module';
import { StartupTaskManager } from './startup';
import { EventDispatcher, StartedEvent } from './events';
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
    ConfigureRouting
} from './startup/routing';
import { CSRFTokenSupport } from './startup/csrf';
import { StaticDirSupport } from './startup/static';

const defaultServConf = { port: 2407, host: '0.0.0.0' };

const dconf = { log: { level: 'error' } };

export type ModuleConfProvider = (app: App) => ModuleConf;

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
        public pool = getInstance(),
        public server = new Server(conf.app?.server ?? defaultServConf),
        public events = new EventDispatcher(),
        public rootInfo: Maybe<ModuleInfo> = Maybe.nothing(),
        public startup = new StartupTaskManager(modules, [
            new ConfigureEventListeners(events),
            new PoolConnections(pool, events),
            new ConfigureRequestLogger(),
            new SessionSupport(pool),
            new CookieSupport(),
            new ConfigureBodyParser(),
            new BuildGlobalFilters(),
            new BuildRouteFilters(),
            new BuildAvailableMiddleware(),
            new BuildEnabledMiddleware(),
            new CSRFTokenSupport(),
            new StaticDirSupport(),
            new ConfigureRouting()
        ])
    ) {}

    /**
     * registerModule creates internal tracking information for newly created
     * modules.
     */
    registerModule(module: Module) {
        let parent = this.modules[getParent(module.address)];
        let conf = module.conf;
        let info = {
            path: conf?.app?.path ?? conf.id ?? '/',
            address: module.address,
            conf,
            parent,
            express: express(),
            module,
            routing: {
                middleware: { available: new Map(), enabled: [] },
                globalFilters: [],
                handlers: {},
                routes: [],
                dirs: []
            },
            connections: {}
        };

        this.modules[module.address] = info;

        return info;
    }

    /**
     * start the App.
     */
    async start() {
        await this.vm.spawn({
            ...this.conf,
            spawnConcern: 'receiving',
            create: runtime => {
                let root = this.registerModule(
                    new Module(this, runtime, this.conf)
                );
                this.rootInfo = Maybe.just(root);
                return root.module;
            }
        });

        await this.startup.run();

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
