import * as express from 'express';
import * as mware from './middleware';
import * as show from './show';
import * as hooks from './hooks';
import * as conn from './connection';
import * as config from '@quenk/potoo/lib/actor/system/configuration';
import { merge, reduce, map, values } from '@quenk/noni/lib/data/record';
import { Maybe, just, fromNullable, nothing } from '@quenk/noni/lib/data/maybe';
import { Either, left, right } from '@quenk/noni/lib/data/either'
import { cons, noop } from '@quenk/noni/lib/data/function';
import {
    Future,
    pure,
    parallel,
    attempt
} from '@quenk/noni/lib/control/monad/future';
import {
    State,
    getParent,
    getChildren,
    getAddress,
    get,
    put
} from '@quenk/potoo/lib/actor/system/state';
import { Envelope } from '@quenk/potoo/lib/actor/mailbox';
import { Drop } from '@quenk/potoo/lib/actor/system/op/drop';
import { System } from '@quenk/potoo/lib/actor/system';
import { Actor } from '@quenk/potoo/lib/actor';
import { Template as PotooTemplate } from '@quenk/potoo/lib/actor/template';
import { ADDRESS_DISCARD, Address } from '@quenk/potoo/lib/actor/address';
import { Executor, Op, log } from '@quenk/potoo/lib/actor/system/op';
import { Server, Configuration } from '../net/http/server';
import { Pool } from './connection';
import { Template } from './module/template';
import { Context, ModuleContext, newContext } from './state/context';

/**
 * App is the main class of the framework.
 *
 * This class functions as an actor system and your
 * application.
 */
export class App implements System<Context>, Executor<Context> {

    constructor(public main: Template, public configuration: config.Configuration) { }

    public state: State<Context> = { contexts: {}, routes: {} };

    stack: Op<Context>[] = [];

    running: boolean = false;

    express: express.Application = express();

    server: Server = new Server(defaultServerConf(this.main.server));

    pool: Pool = new Pool({});

    middleware: { [key: string]: mware.Middleware } = {};

    paths: string[] = [];

    /**
     * initialize the App
     *
     * Invokes the init hooks of all modules.
     */
    initialize(): Future<App> {

        return parallel(values<Future<void>>(map(this.state.contexts,
            initContext))).map(cons(<App>this));

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
            .chain(() => parallel(values(map(this.state.contexts, connectedFrame))))
            .map(cons(<App>this));

    }

    middlewares(): Future<App> {

        map(this.state.contexts, f =>
            f.module.map(m => installMiddleware(this, m)));

        return pure(<App>this);

    }

    routing(): Future<App> {

        return attempt(() => map(this.state.contexts, f =>
            f.module.map(m => m.routes(m.module, m.app)))).map(cons(<App>this));

    }

    linking() {

        map(this.state.contexts, (pc, k) =>
            map(getChildren(this.state, k), (c: Context, path) =>
                pc.module.chain(m => c.module.map(cm => m.app.use(path, cm.app)))));

        get(this.state, this.paths[0])
            .chain(c => c.module)
            .map(m => this.express.use(m.app));

        return pure(<App>this);

    }

    spawn(path: string, parent: express.Application, tmpl: Template): App {

        let module = tmpl.create(this);
        let app = express();

        let mctx: ModuleContext = {
            path,
            module,
            app,
            hooks: defaultHooks(tmpl),
            middleware: defaultEnabledMiddleware(tmpl),
            routes: defaultRoutes(tmpl),
            show: defaultShow(tmpl, path, this),
            connections: defaultConnections(tmpl)
        };

        this.middleware = merge(this.middleware, defaultMiddlware(tmpl));

        put(this.state, path, newContext(just(mctx), module, tmpl));

        parent.use(path, app);

        if (tmpl.app && tmpl.app.modules)
            map(tmpl.app.modules, (m, k) =>
                this.spawn(`${path}${path === '/' ? '' : '/'}${k}`, app, m));

        return this;

    }

    allocate(t: PotooTemplate<Context>): Context {

        let actor = t.create(this);
        return actor.init(newContext(nothing(), actor, t));

    }

    init(c: Context): Context {

        return c;

    }

    identify(actor: Actor<Context>): Address {

        return getAddress(this.state, actor)
            .orJust(() => ADDRESS_DISCARD)
            .get();

    }

    exec(code: Op<Context>): App {

        this.stack.push(code);
        this.run();
        return this;

    }

    accept({ to, from, message }: Envelope): App {

        return this.exec(new Drop(to, from, message));

    }

    run(): void {

        let { level, logger } = <config.LogPolicy>this.configuration.log;

        if (this.running) return;

        this.running = true;

        while (this.stack.length > 0)
            log(level || 0, logger || console, <Op<Context>>this.stack.pop()).exec(this);

        this.running = false;

    }

    start(): Future<App> {

        return this
            .spawn(this.main.id, this.express, this.main)
            .initialize()
            .chain(() => this.connections())
            .chain(() => this.middlewares())
            .chain(() => this.routing())
            .chain(() => this.server.listen(this.express))
            .map(cons(<App>this));

    }

    stop(): Future<void> {

        //@todo stop child actors

        return this
            .server
            .stop()
            .chain(() => this.pool.close())
            .map(() => {

                this.stack = [];
                this.state = { contexts: {}, routes: {} };
                this.running = false;
                this.express = express();
                this.pool = new Pool({});
                this.middleware = {};
                this.paths = [];

            });

    }

}

const defaultServerConf = (conf: Configuration | undefined): Configuration =>
    merge({ port: 2407, host: '0.0.0.0' }, (conf == null) ? {} : conf);

const defaultHooks = (t: Template) => (t.app && t.app.on) ?
    t.app.on : {}

const defaultConnections = (t: Template): conn.Connections => t.connections ?
    map(t.connections, c => c.options ?
        c.connector.apply(null, c.options || []) :
        c.connector) : {};

const defaultMiddlware = (t: Template) =>
    (t.app && t.app.middleware && t.app.middleware.available) ?
        map(t.app.middleware.available, m =>
            m.provider.apply(null, m.options || [])) : {}

const defaultEnabledMiddleware = (t: Template) =>
    (t.app && t.app.middleware && t.app.middleware.enabled) ?
        t.app.middleware.enabled : [];

const defaultRoutes = (t: Template) =>
    (t.app && t.app.routes) ? t.app.routes : noop;

const defaultShow = (t: Template, path: Address, app: App): Maybe<show.Show> =>
    (t.app && t.app.views) ?
        just(t.app.views.provider.apply(null, t.app.views.options || [])) : (
            getParent(app.state, path)
                .chain(f => f.module)
                .chain(m => m.show));

const initContext = (f: Context): Future<void> =>
    f
        .module
        .chain(m => fromNullable(m.hooks.init))
        .map((i: hooks.Init) => i())
        .orJust(() => pure(noop()))
        .get();

const connectedFrame = (f: Context): Future<void> =>
    f
        .module
        .chain(m => fromNullable(m.hooks.connected))
        .map((c: hooks.Connected) => c())
        .orJust(() => pure(noop()))
        .get();

const installMiddleware = (app: App, m: ModuleContext): Either<Error, void> =>
    m
        .middleware
        .reduce(verifyMiddleware(app), right([]))
        .map((list: mware.Middleware[]) => (list.length > 0) ?
            m.app.use.apply(m.app, list) :
            right(noop()))
        .map(noop);

const verifyMiddleware =
    (app: App) => (p: Either<Error, mware.Middleware[]>, c: string) =>
        p.chain(verifyMiddleware_(c, app.middleware));

const verifyMiddleware_ =
    (curr: string, wares: mware.Middlewares) => (list: mware.Middleware[])
        : Either<Error, mware.Middleware[]> =>
        wares.hasOwnProperty(curr) ?
            right(list.concat(wares[curr])) :
            left(new Error(`Unknown wares "${curr}"!`));
