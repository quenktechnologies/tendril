import * as express from 'express';

import { merge, mapTo } from '@quenk/noni/lib/data/record';
import {
    Maybe,
    just,
    nothing
} from '@quenk/noni/lib/data/maybe';
import {
    Future,
    pure,
    sequential
} from '@quenk/noni/lib/control/monad/future';
import { PVM } from '@quenk/potoo/lib/actor/system/vm';
import { System } from '@quenk/potoo/lib/actor/system';
import { Instance } from '@quenk/potoo/lib/actor';
import { Template as PotooTemplate } from '@quenk/potoo/lib/actor/template';
import { Address } from '@quenk/potoo/lib/actor/address';
import { PTValue } from '@quenk/potoo/lib/actor/system/vm/type';
import { Script } from '@quenk/potoo/lib/actor/system/vm/script';

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

const defaultServConf = { port: 2407, host: '0.0.0.0' };

const dconf = { log: { level: 3 } }

/**
 * App is the main entry point to the framework.
 *
 * An App serves as an actor system for all the modules of the application.
 * It configures routing of requests for each module and makes whatever services
 * the user desires available via child actors.
 */
export class App implements System {

    constructor(public provider: (s: App) => Template<App>) { }

    main = <Template<App>>this.provider(this);

    vm = PVM.create(this, this.main.app && this.main.app.system || dconf);

    modules = <ModuleDatas>{};

    server = new Server(getServerConf(this.main, defaultServConf));

    pool = getInstance();

    hooks = <Dispatcher<this>>new Dispatcher(this);

    stages = App.createDefaultStageBundle(this);

    /**
     * create a new Application instance.
     */
    static create(provider: (s: App) => Template<App>): App {

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
            new ListenStage(app.server, app.hooks, provideMain)
        ]);

    }

    exec(i: Instance, s: Script): void {

        return this.vm.exec(i, s);

    }

    execNow(i: Instance, s: Script): Maybe<PTValue> {

        return this.vm.execNow(i, s);

    }

    /**
     * spawn a regular actor from a template.
     *
     * This actor must use the same Context type as the App.
     */
    spawn(tmpl: PotooTemplate<System>): App {

        this.vm.spawn(tmpl);

        return this;

    }

    /**
     * spawnModule (not a generic actor) from a template.
     *
     * A module must have a parent unless it is the root module of the app.
     */
    spawnModule(
        path: string,
        parent: Maybe<ModuleData>,
        tmpl: Template<App>): Future<Address> {

        let module = tmpl.create(this);

        let t = merge(tmpl, { create: () => module });

        let address = parent.isNothing() ?
            this.vm.spawn(<PotooTemplate<System>>t) :
            parent.get().module.spawn(t);

        let app = express();

        let mctx: ModuleData = {
            path,
            address,
            parent,
            app,
            module,
            hooks: getHooks(t),
            template: t,
            middleware: {

                enabled: getEnabledMiddleware(t),

                available: getAvailableMiddleware(t)

            },
            routes: getRoutes(t),
            show: getShowFun(t, parent),
            connections: getConnections(t),
            disabled: t.disabled || false,
            redirect: nothing()
        };

        this.modules[address] = mctx;

        if (t.app && t.app.modules) {

            let mmctx = just(mctx);

            return sequential(mapTo(t.app.modules, (c, k) =>
                this.spawnModule(k, mmctx, c(this))))
                .chain(() => pure(address));

        } else {

            return pure(address);

        }

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

    /**
     * start the App.
     */
    start(): Future<App> {

        return this
            .spawnModule(mainPath(this.main.id), nothing(), this.main)
            .chain(() => this.stages.execute())
            .map(() => <App>this);

    }

    stop(): Future<void> {

        return this
            .server
            .stop()
            .chain(() => this.pool.close())
            .chain(() => this.vm.stop());

    }

}

const mainPath = (path?: string): string => (path != null) ? path : '/';
