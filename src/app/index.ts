import * as express from 'express';
import * as mware from './middleware';
import * as show from './show';
import * as hooks from './hooks';
import * as conn from './connection';
import * as config from '@quenk/potoo/lib/actor/system/configuration';
import { merge, reduce, map, values } from '@quenk/noni/lib/data/record';
import {
    Maybe,
    just,
    fromNullable,
    fromArray,
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
import {
    State,
    getParent,
    getAddress,
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
import { Context, Module as ModuleContext, getModule } from './state/context';

/**
 * App is the main class of the framework.
 *
 * This class functions as an actor system and your
 * application.
 */
export class App implements System<Context>, Executor<Context> {

    constructor(public main: Template, public configuration: config.Configuration) { }

     state: State<Context> = { contexts: {}, routes: {} };

    stack: Op<Context>[] = [];

    running: boolean = false;

    server: Server = new Server(defaultServerConf(this.main.server));

    pool: Pool = new Pool({});

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
            .chain(() => parallel(values(map(this.state.contexts, dispatchConnected))))
            .map(cons(<App>this));

    }

    /**
     * middlewares installs the middleware each module declares.
     */
    middlewares(): Future<App> {

        return reduce(this.state.contexts, pure(<App>this), (p, c) =>
            c
                .module
                .map(m =>
                    getMwares(m)
                        .map(wares =>
                            wares
                                .map(list => m.app.use.apply(m.app, list))
                                .orJust(() => { })
                                .map(() => p)
                                .get())
                        .orRight(e => raise(e))
                        .takeRight())
                .orJust(() => p)
                .get());

    }

    routing(): Future<App> {

        return attempt(() => map(this.state.contexts, f =>
            f.module.map(m => m.routes(m.module, m.app)))).map(cons(<App>this));

    }

    /**
     * listen for incomming connections.
     */
    listen() {

        return getModule(this.state, this.main.id)
            .map(m => this.server.listen(m.app))
            .get();

    }

    spawn(path: string, parent: Maybe<ModuleContext>, tmpl: Template): App {

        let module = tmpl.create(this);
        let app = express();

        let mctx: ModuleContext = {
            path,
            parent,
            module,
            app,
            hooks: defaultHooks(tmpl),
            middleware: {
                enabled: defaultEnabledMiddleware(tmpl),
                available: defaultAvailableMiddleware(tmpl)
            },
            routes: defaultRoutes(tmpl),
            show: defaultShow(tmpl, path, this),
            connections: defaultConnections(tmpl)
        };

        put(this.state, path, newContext(just(mctx), module, tmpl));

        parent.map(m => m.app.use(path, app));

        if (tmpl.app && tmpl.app.modules)
            map(tmpl.app.modules, (m, k) =>
                this.spawn(`${path}${path === '/' ? '' : '/'}${k}`, just(mctx), m));

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
            .spawn(this.main.id, nothing(), this.main)
            .initialize()
            .chain(() => this.connections())
            .chain(() => this.middlewares())
            .chain(() => this.routing())
            .chain(() => this.listen())
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
                this.pool = new Pool({});
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

const defaultAvailableMiddleware = (t: Template): mware.Middlewares =>
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

const dispatchConnected = (f: Context): Future<void> =>
    f
        .module
        .chain(m => fromNullable(m.hooks.connected))
        .map((c: hooks.Connected) => c())
        .orJust(() => pure(noop()))
        .get();

const getMwares = (m: ModuleContext): Either<Error, Maybe<mware.Middleware[]>> =>
    m
        .middleware
        .enabled
        .reduce(swap(m), right([]))
        .map(fromArray);

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

const newContext = (
    module: Maybe<ModuleContext>,
    actor: Actor<Context>,
    template: PotooTemplate<Context>): Context => ({

        module,
        mailbox: nothing(),
        actor,
        behaviour: [],
        flags: { immutable: true, buffered: true },
        template

    });
