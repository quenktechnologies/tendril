import * as express from 'express';
import * as mware from './middleware';
import * as show from './show';
import * as hooks from './hooks';
import * as conn from './connection';
import * as config from '@quenk/potoo/lib/actor/system/configuration';
import { join } from 'path';
import { merge, reduce, map, values } from '@quenk/noni/lib/data/record';
import { Err } from '@quenk/noni/lib/control/error';
import {
    Maybe,
    just,
    fromNullable,
    fromBoolean,
    nothing
} from '@quenk/noni/lib/data/maybe';
import { Either, left, right } from '@quenk/noni/lib/data/either'
import { cons, noop } from '@quenk/noni/lib/data/function';
import {
    Future,
    pure,
    raise,
    parallel,
    attempt
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
import { Server, Configuration } from '../net/http/server';
import { Pool } from './connection';
import { Template } from './module/template';
import { Context, Module as ModuleContext, getModule } from './state/context';

/**
 * App is the main class of the framework.
 *
 * This class functions as an actor system and your
 * application.
 */
export class App extends AbstractSystem<Context> implements System<Context> {

    constructor(
        public main: Template,
        public configuration: config.Configuration = {}) { super(configuration); }

    state: State<Context> = newState(this);

    server: Server = new Server(defaultServerConf(this.main.server));

    pool: Pool = new Pool({});

    allocate(
        a: Actor<Context>,
        r: Runtime<Context, System<Context>>,
        t: PotooTemplate<Context, App>): Context {

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
    spawn(tmpl: PotooTemplate<Context, App>): App {

        (new This('$', this)).exec(new SpawnScript('', tmpl));
        return this;

    }

    /**
     * spawnModule (not a generic actor) from a template.
     *
     * A module may or may not have a parent. In the case of the latter the
     * module should be the root module of tha App.
     */
    spawnModule(path: string, parent: Maybe<ModuleContext>, tmpl: Template): App {

        let module = tmpl.create(this);
        let app = express();
        let address = defaultAddress(path, parent);
        let runtime = new This(address, <any>this);

        let mctx: ModuleContext = {
            path,
            address,
            parent,
            module,
            app,
            hooks: defaultHooks(tmpl),
            middleware: {
                enabled: defaultEnabledMiddleware(tmpl),
                available: defaultAvailableMiddleware(tmpl)
            },
            routes: defaultRoutes(tmpl),
            show: defaultShow(tmpl, parent),
            connections: defaultConnections(tmpl),
            disabled: tmpl.disabled || false,
            redirect: nothing()
        };

        put(this.state, address,
            module.init(newContext(just(mctx), module, <any>runtime, tmpl)));

        if (tmpl.app && tmpl.app.modules)
            map(tmpl.app.modules, (m, k) => this.spawnModule(k, just(mctx), m));

        if (Array.isArray(tmpl.children))
            tmpl.children.forEach(c => runtime.exec(new SpawnScript(address, c)));

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

        return parallel(values<Future<void>>(map(this.state.contexts,
            initContext(this)))).map(cons(<App>this));

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
            .chain(() => parallel(values(map(this.state.contexts,
                dispatchConnected(this)))))
            .map(cons(<App>this));

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

        return attempt(() => map(this.state.contexts, c =>
            c
                .module
                .map(m => {

                    m.routes(m.module);
                    m.parent.map(p => p.app.use(join('/', m.path), m.app));

                })))
            .map(cons(<App>this));

    }

    /**
     * listen for incomming connections.
     */
    listen() {

        return getModule(this.state, this.main.id)
            .map(m => this.server.listen(m.app))
            .get();

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
            .chain(() => startListening(this));

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

const defaultServerConf = (conf: Configuration | undefined): Configuration =>
    merge({ port: 2407, host: '0.0.0.0' }, (conf == null) ? {} : conf);

const defaultAddress = (path: string, parent: Maybe<ModuleContext>) =>
    parent
        .map(m => m.address)
        .map(a => join(a, path))
        .orJust(() => path)
        .get();

const defaultHooks = (t: Template) => (t.app && t.app.on) ?
    t.app.on : {}

const defaultConnections = (t: Template): conn.Connections =>
    <conn.Connections>(t.connections ?
        map(t.connections, c => c.options ?
            c.connector.apply(null, c.options || []) :
            c.connector) : {});

const defaultAvailableMiddleware = (t: Template): mware.Middlewares =>
    (t.app && t.app.middleware && t.app.middleware.available) ?
        map(t.app.middleware.available, m =>
            m.provider.apply(null, m.options || [])) : {}

const defaultEnabledMiddleware = (t: Template) =>
    (t.app && t.app.middleware && t.app.middleware.enabled) ?
        t.app.middleware.enabled : [];

const defaultRoutes = (t: Template) =>
    (t.app && t.app.routes) ? t.app.routes : noop;

const defaultShow = (t: Template, parent: Maybe<ModuleContext>): Maybe<show.Show> =>
    (t.app && t.app.views) ?
        just(t.app.views.provider.apply(null, t.app.views.options || [])) :
        parent.chain(m => m.show);

const initContext = (a: App) => (c: Context): Future<void> =>
    c
        .module
        .chain(m => fromNullable(m.hooks.init))
        .map((i: hooks.Init) => i(a))
        .orJust(() => pure(noop()))
        .get();

const dispatchConnected = (a: App) => (c: Context): Future<void> =>
    c
        .module
        .chain(m => fromNullable(m.hooks.connected))
        .map((c: hooks.Connected) => c(a))
        .orJust(() => pure(noop()))
        .get();

const applyMware = (app: Future<App>) => (m: ModuleContext): Future<App> =>
    m
        .middleware
        .enabled
        .reduce(swap(m), right([preroute(m)]))
        .map(list => m.app.use.apply(m.app, list))
        .map(() => app)
        .orRight(e => <Future<App>>raise(e))
        .takeRight();

const preroute = (module: ModuleContext) =>
    (_: express.Request, res: express.Response, next: express.NextFunction) =>
        fromBoolean(module.disabled)
            .map(() => res.status(404).end())
            .orElse(() => module.redirect.map(r => res.redirect(r.status, r.location)))
            .orJust(() => next());

const swap = (m: ModuleContext) => (p: Either<Error, mware.Middleware[]>, c: string)
    : Either<Error, mware.Middleware[]> =>
    m.middleware.available.hasOwnProperty(c) ?
        p
            .map(concatMware(m, c)) :
        m
            .parent
            .map(parent => swap(parent)(p, c))
            .orJust(errMware(m.path, c))
            .get();

const concatMware = (m: ModuleContext, key: string) => (list: mware.Middleware[]) =>
    list.concat(m.middleware.available[key])

const errMware = (path: string, key: string) => ()
    : Either<Error, mware.Middleware[]> =>
    left(new Error(`${path}: Unknown middleware "${key}"!`));

const startListening = (a: App): Future<App> => {

    let list: Future<void>[] = values(map(a.state.contexts, dispatchStart(a)));

    return parallel([a.listen().map(() => { }), ...list])
        .map(() => a);

}

const dispatchStart = (a: App) => (c: Context): Future<void> =>
    c
        .module
        .chain(m => fromNullable(m.hooks.start))
        .map((h: hooks.Start) => h(a))
        .orJust(() => pure(noop()))
        .get();

const newState = (app: App): State<Context> => ({

    contexts: {

        $: newContext(nothing(), app, new This('$', <any>app), {
            id: '$',
            create: () => new App(app.main),
            trap: (e: Err) => {

                if (e instanceof Error) {
                    throw e;
                } else {
                    throw new Error(e.message);
                }

            }
        })

    },
    routers: {}

});

const newContext = (
    module: Maybe<ModuleContext>,
    actor: Actor<Context>,
    runtime: Runtime<Context, System<Context>>,
    template: PotooTemplate<Context, App>): Context => ({

        module,
        mailbox: nothing(),
        actor,
        runtime,
        behaviour: [],
        flags: { immutable: true, buffered: false },
        template

    });
