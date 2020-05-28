import * as express from 'express';
import * as conn from './connection';

import { join } from 'path';

import { Type } from '@quenk/noni/lib/data/type';
import { noop } from '@quenk/noni/lib/data/function';
import { merge, reduce, map, mapTo } from '@quenk/noni/lib/data/record';
import {
    Maybe,
    just,
    fromBoolean,
    nothing
} from '@quenk/noni/lib/data/maybe';
import { Either, left, right } from '@quenk/noni/lib/data/either'
import { cons } from '@quenk/noni/lib/data/function';
import {
    Future,
    pure,
    raise,
    attempt,
    parallel,
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
import { Pool, getInstance } from './connection';
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
import { Middleware } from './middleware';
import { Filter } from './api/filter';
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

    main: Template<App> = this.provider(this);

    vm = PVM.create(this, this.main.app && this.main.app.system || dconf);

    modules: ModuleDatas = {};

    server: Server = new Server(getServerConf(this.main, defaultServConf));

    pool: Pool = getInstance();

    hooks: Dispatcher<this> = new Dispatcher(this);

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
    spawn(tmpl: PotooTemplate<this>): App {

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
            this.vm.spawn(<Template<this>>t) :
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
     * initialize the App
     *
     * Invokes the init hooks of all modules.
     */
    initialize(): Future<App> {

        return this.hooks.init().map(() => <App>this);

    }

    /**
     * connections opens all the connections the modules of the App have
     * declared.
     *
     * Connections are open in parallel, any failing will prevent the whole
     * application from booting.
     */
    connections(): Future<App> {

        return reduce(this.modules, this.pool, (p, m) => {

            map(m.connections, (c: conn.Connection, k) => p.add(k, c));

            return p;

        })
            .open()
            .chain(() => this.hooks.connected())
            .map(() => <App>this);

    }

    /**
     * middlewares installs the middleware each module declares.
     */
    middlewares(): Future<App> {

        return reduce(this.modules, pure(<App>this),
            (p, c) => applyMware(p, c));

    }

    /**
     * routing installs all the routes of each module and creates a tree
     * out of express.
     */
    routing(): Future<App> {

        return attempt(() => map(this.modules, m => {

            let mod = m.module;
            let t: Template<App> = <Template<App>><Type>m.template;
            let routes = m.routes(m.module);

            if (t.app && t.app.filters) {

                let filters = t.app.filters;

                mod.install(routes.map(r => ({

                    method: r.method,

                    path: r.path,

                    filters: <Filter<undefined>[]>[...filters, ...r.filters]

                })));

            } else {

                mod.install(routes);

            }

            if (t.app && t.app.notFoundHandler)
                m.app.use(mod.runInContext([t.app.notFoundHandler]));

            if (t.app && t.app.errorHandler)
                m.app.use(mod.runInContextWithError(t.app.errorHandler));

            m.parent.map(p => p.app.use(join('/', m.path), m.app));

        }))
            .map(cons(<App>this));

    }

    /**
     * listen for incoming connections.
     */
    listen(): Future<void> {

        let mmodule = getModule(this.modules, mainPath(this.main.id));

        if (mmodule.isJust())
            return this.server.listen(mmodule.get().app).map(noop);
        else
            return raise(new Error('Server not initialized!'));

    }

    /**
     * start the App.
     */
    start(): Future<App> {

        return this
            .spawnModule(mainPath(this.main.id), nothing(), this.main)
            .chain(() => this.initialize())
            .chain(() => this.connections())
            .chain(() => this.middlewares())
            .chain(() => this.routing())
            .chain(() => parallel([this.listen(), this.hooks.started()]))
            .map(() => <App>this);

    }

    stop(): Future<void> {

        return this
            .server
            .stop()
            .chain(() => this.pool.close())
            .chain(() => this.vm.stop())
            .map(() => {

                this.pool.store = {};

            });

    }

}

const mainPath = (path?: string): string => (path != null) ? path : '/';

const applyMware = (app: Future<App>, m: ModuleData): Future<App> =>
    m
        .middleware
        .enabled
        .reduce(swap(m), right([preroute(m)]))
        .map(list => m.app.use.apply(m.app, <any>list))
        .map(() => app)
        .orRight(e => <Future<App>>raise(e))
        .takeRight();

const preroute = (module: ModuleData) =>
    (_: express.Request, res: express.Response, next: express.NextFunction) =>
        fromBoolean(module.disabled)
            .map(() => res.status(404).end())
            .orElse(() => module.redirect.map(r =>
                res.redirect(r.status, r.location)))
            .orJust(() => next());

const swap = (m: ModuleData) => (p: Either<Error, Middleware[]>, c: string)
    : Either<Error, Middleware[]> =>
    m.middleware.available.hasOwnProperty(c) ?
        p
            .map(concatMware(m, c)) :
        m
            .parent
            .map(parent => swap(parent)(p, c))
            .orJust(errMware(m.path, c))
            .get();

const concatMware = (m: ModuleData, key: string) => (list: Middleware[]) =>
    list.concat(m.middleware.available[key])

const errMware = (path: string, key: string) => ()
    : Either<Error, Middleware[]> =>
    left(new Error(`${path}: Unknown middleware "${key}"!`));
