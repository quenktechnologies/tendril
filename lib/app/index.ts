import * as express from 'express';
import * as conn from './connection';
import * as config from '@quenk/potoo/lib/actor/system/configuration';
import { join } from 'path';
import { Type } from '@quenk/noni/lib/data/type';
import { noop } from '@quenk/noni/lib/data/function';
import { merge, reduce, map } from '@quenk/noni/lib/data/record';
import { Err } from '@quenk/noni/lib/control/error';
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
    parallel
} from '@quenk/noni/lib/control/monad/future';
import { State, put } from '@quenk/potoo/lib/actor/system/state';
import { Message } from '@quenk/potoo/lib/actor/message';
import { TellScript } from '@quenk/potoo/lib/actor/resident/scripts';
import { SpawnScript } from '@quenk/potoo/lib/actor/system/framework/scripts';
import { AbstractSystem } from '@quenk/potoo/lib/actor/system/framework';
import { StopScript } from '@quenk/potoo/lib/actor/system/vm/runtime/scripts';
import { This } from '@quenk/potoo/lib/actor/system/vm/runtime/this';
import { Runtime } from '@quenk/potoo/lib/actor/system/vm/runtime';
import { System } from '@quenk/potoo/lib/actor/system';
import { Actor } from '@quenk/potoo/lib/actor';
import { Template as PotooTemplate } from '@quenk/potoo/lib/actor/template';
import { Address } from '@quenk/potoo/lib/actor/address';
import { Server } from '../net/http/server';
import { Pool, getInstance } from './connection';
import { SpawnConf } from './module/conf/spawn';
import { Template } from './module/template';
import { Context, ModuleData, getModule } from './actor/context';
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

/**
 * App is the main entry point to the framework.
 *
 * An App serves as an actor system for all the modules of the application.
 * It configures routing of requests for each module and makes whatever services
 * the user desires available via child actors.
 */
export class App extends AbstractSystem implements System {

    constructor(public provider: (s: App) => Template<App>) {

        super({});

    }

    state: State<Context> = newState(this);

    main: Template<App> = this.provider(this);

    configuration: config.Configuration =
        this.main.app && this.main.app.system || this.configuration;

    server: Server = new Server(getServerConf(this.main, defaultServConf));

    pool: Pool = getInstance();

    hooks: Dispatcher<this> = new Dispatcher(this);

    init(c: Context): Context { return c; }

    allocate(
        a: Actor<Context>,
        r: Runtime,
        t: PotooTemplate<App>): Context {

        return newContext(nothing(), a, r, t);

    }

    /**
     * tell a message to an actor in the system.
     */
    tell(to: Address, msg: Message): App {

        (new This('$', this)).exec(new TellScript(to, msg));
        return this;

    }

    /**
     * spawn a regular actor from a template.
     *
     * This actor must use the same Context type as the App.
     */
    spawn(tmpl: PotooTemplate<App>): App {

        (new This('$', this)).exec(new SpawnScript('',
            <PotooTemplate<System>>tmpl));

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
        tmpl: Template<App>): App {

        let module = tmpl.create(this);
        let app = express();
        let address = getModuleAddress(parent, path);
        let runtime = new This(address, this);

        let mctx: ModuleData = {
            path,
            address,
            parent,
            module,
            app,
            hooks: getHooks(tmpl),
            middleware: {
                enabled: getEnabledMiddleware(tmpl),
                available: getAvailableMiddleware(tmpl)
            },
            routes: getRoutes(tmpl),
            show: getShowFun(tmpl, parent),
            connections: getConnections(tmpl),
            disabled: tmpl.disabled || false,
            redirect: nothing()
        };

        put(this.state, address,
            module.init(newContext(just(mctx), module, runtime, tmpl)));

        if (tmpl.app && tmpl.app.modules)
            map(tmpl.app.modules, (m, k) =>
                this.spawnModule(k, just(mctx), m(this)));

        if (Array.isArray(tmpl.children))
            tmpl.children.forEach(c =>
                runtime.exec(new SpawnScript(address, <PotooTemplate<System>>c)));

        if (tmpl.spawn != null)
            map(tmpl.spawn, (c, id) => runtime.exec(new SpawnScript(address,
                <PotooTemplate<System>>mergeSpawnable(id, c))));

        return this;

    }

    /**
     * installMiddleware at the specified mount point.
     *
     * If no module exists there, the attempt will be ignored.
     */
    installMiddleware(path: string, handler: express.RequestHandler): App {

        return getModule(this.state, path)
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

        return reduce(this.state.contexts, this.pool, (p, c) =>
            c
                .module
                .map(m => map(m.connections, (c: conn.Connection, k) => p.add(k, c)))
                .map(cons(p))
                .orJust(() => p)
                .get())
            .open()
            .chain(() => this.hooks.connected())
            .map(() => <App>this);

    }

    /**
     * middlewares installs the middleware each module declares.
     */
    middlewares(): Future<App> {

        return reduce(this.state.contexts, pure(<App>this), (p, c) =>
            c
                .module
                .map(applyMware(p))
                .orJust(() => p)
                .get());

    }

    /**
     * routing installs all the routes of each module and creates a tree
     * out of express.
     */
    routing(): Future<App> {

        return attempt(() => map(this.state.contexts, c => {

            if (c.module.isJust()) {

                let m = c.module.get();
                let mod = m.module;
                let t: Template<App> = <Template<App>><Type>c.template;
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

            }

        }))
            .map(cons(<App>this));

    }

    /**
     * listen for incomming connections.
     */
    listen(): Future<void> {

        let mServer = getModule(this.state, this.main.id);

        if (mServer.isJust())
            return this.server.listen(mServer.get().app).map(noop);
        else
            return raise(new Error('Server not initialized!'));

    }

    /**
     * start the App.
     */
    start(): Future<App> {

        return this
            .spawnModule(this.main.id, nothing(), this.main)
            .initialize()
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
            .map(() => {

                let t = new This('$', this);
                t.exec(new StopScript(this.main.id))

            })
            .map(() => {

                this.state = newState(this);
                this.pool = new Pool({});

            });

    }

}

const getModuleAddress = (parent: Maybe<ModuleData>, path: string) =>
    (parent.isJust()) ? join(parent.get().address, path) : path;

const mergeSpawnable = (id: string, c: SpawnConf): PotooTemplate<App> =>
    merge({

        id,

        create: (s: App) =>
            new c.constructor(...c.arguments.map(a => (a === '$') ? s : a))

    }, c)

const applyMware = (app: Future<App>) => (m: ModuleData): Future<App> =>
    m
        .middleware
        .enabled
        .reduce(swap(m), right([preroute(m)]))
        .map(list => m.app.use.apply(m.app, list))
        .map(() => app)
        .orRight(e => <Future<App>>raise(e))
        .takeRight();

const preroute = (module: ModuleData) =>
    (_: express.Request, res: express.Response, next: express.NextFunction) =>
        fromBoolean(module.disabled)
            .map(() => res.status(404).end())
            .orElse(() => module.redirect.map(r => res.redirect(r.status, r.location)))
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

const newState = (app: App): State<Context> => ({

    contexts: {

        $: newContext(nothing(), app, new This('$', app), {
            id: '$',
            create: () => new App(() => app.main),
            trap: (e: Err) => {

                if (e instanceof Error) {
                    throw e;
                } else {
                    throw new Error(e.message);
                }

            }
        })

    },
    routers: {},

    groups: {}

});

const newContext = (
    module: Maybe<ModuleData>,
    actor: Actor<Context>,
    runtime: Runtime,
    template: PotooTemplate<App>): Context => ({

        module,
        mailbox: nothing(),
        actor,
        runtime,
        behaviour: [],
        flags: { immutable: true, buffered: false },
        template: <PotooTemplate<System>>template

    });
