import * as http from 'http';
import * as Bluebird from 'bluebird';
import * as express from 'express';
import * as data from '../data';
import { map } from 'afpl/lib/util';
import { ManagedServer } from '../server';
import { Renderer } from './Renderer';

/**
 * Conf is the top level conf namespace.
 */
export interface Conf<A> {

    tendril?: {

        server?: ServerConf;
        data?: DataConf<A>;
        app?: AppConf<A>;

    }

}

/**
 * ServerConf settings for the http server.
 */
export interface ServerConf {

    port?: string;
    host?: string;

}

/**
 * DataConf settings for establishing remote connections
 */
export interface DataConf<A> {

    connections?: ConnectionsConf<A>

}

/**
 * ConnectionsConf settings for establishing remote connections.
 */
export interface ConnectionsConf<A> {

    [key: string]: Connection<A>

}

/**
 * Configuration settings for a single connection.
 */
export interface Connection<A> {

    connector: (options: Options<A>) => Bluebird<data.Connection>
    options?: Options<A>

}

/**
 * AppConf settings for the application.
 */
export interface AppConf<A> {

    modules?: ModulesConf<A>;
    filters?: FiltersConf<A>;
    views?: ViewsConf<A>;
    errors?: ErrorsConf<A>;

}

/**
 * ModulesConf provides settings for modules.
 */
export interface ModulesConf<C> {

    [key: string]: ModuleConf<C>

}

export interface ModuleConf<C> {

    (name: string): Module<C>

}

/**
 * FiltersConf settings for configuring middleware.
 */
export interface FiltersConf<A> {

    available?: AvailableFiltersConf<A>;
    enabled?: string[]

}

/**
 * AvailableFiltersConf that can be used in the enabled section.
 */
export interface AvailableFiltersConf<A> {

    [key: string]: FilterConf<A>

}

/**
 * Filter settings for one one middleware.
 */
export interface FilterConf<A> {

    module: (options?: Options<A>) => express.RequestHandler
    options?: Options<A>


}

/**
 * ViewsConf settings for configuring view engines.
 */
export interface ViewsConf<A> {

    engine: {

        module: (options: Options<A>) => Bluebird<Renderer>
        options?: Options<A>

    }

}

export interface ErrorsConf<C> {

    handler?: (e: Error, req: express.Request, res: express.Response, module: Module<C>) => void

}

/**
 * Options 
 */
export interface Options<A> {

    [key: string]: A

}

export class DefaultRenderer {

    constructor(public name: string) { }

    render(): Bluebird<string> {

        return Bluebird.reject(new Error(`No view engine configured for module '${this.name}'`));

    }

}

export interface RouteFn<C> {

    (app: express.Application, renderer: Renderer, module: Module<C>): void;

}

/**
 * Module
 */
export class Module<C>  {

    _modules: Module<C>[] = [];
    _application: Application<C>
    _app: express.Application = express();
    _renderer: Renderer;

    constructor(
        public name: string,
        public configuration: Conf<C>,
        public routeFn: RouteFn<C>) { }

    getApp(): Application<C> {

        return this._application;

    }

    getExpressApp(): express.Application {

        return this._app;

    }

    getConf(): Conf<C> {

        return this.configuration;

    }

    onError(e: Error, req: express.Request, res: express.Response): void {

        let t = this.configuration.tendril;

        if (t && t.app && t.app.errors && t.app.errors.handler)
            return t.app.errors.handler(e, req, res, this);

    }

    submodules(): Bluebird<void> {

        let t = this.configuration.tendril;

        return (t && t.app && t.app.modules) ?
            this._modules
                .push
                .apply(map(t.app.modules,
                    (f, k) => this._modules.push(f(k))))

            : Bluebird
                .reduce(this._modules, (_: void, m: Module<C>) => m.submodules())
                .then(() => Bluebird.resolve());

    }

    connections(): Bluebird<void> {

        let t = this.configuration.tendril;
        let p: Bluebird<void | void[]>;

        if (t && t.data && t.data.connections) {

            p = Bluebird
                .all(map(t.data.connections, (c: data.Connection, k: string) =>
                    c.connector(c.options).then(c => { data.Pool.add(k, c); })))
        } else {

            p = Bluebird.resolve();

        }

        return p
            .then(() => Bluebird
                .reduce(this._modules, (_, m) => m.connections())
                .then(() => Bluebird.resolve()));

    }

    middleware(): Bluebird<void> {

        let t = this.configuration.tendril;
        let eapp = this._app;
        let p: Bluebird<void>;

        if (t && t.app && t.app.filters && t.app.filters.enabled) {

            p = Bluebird.reduce(t.app.filters.enabled, (_, name: string) => {

                let available = t.app.filters.available;

                return (available && available[name]) ?
                    Bluebird.try(() =>
                        eapp.use(available[name].options ?
                            available[name].module(available[name].options) :
                            available[name].module())) :
                    Bluebird.reject(new Error(`Unknown filter '${name}' in module '${this.name}'!`))

            });

        } else {

            p = Bluebird.resolve();

        }

        return p.then(() => Bluebird
            .reduce(this._modules, (_, m) => m.middleware())
            .then(() => Bluebird.resolve()));

    }

    routes(): Bluebird<void> {

        return Bluebird.try(() => this.routeFn(this._app, this._renderer, this))
            .then(() => Bluebird.reduce(this._modules, (_: void, m: Module<C>) => m.routes()));

    }

    views(): Bluebird<void> {

        let t = this.configuration.tendril;

        return ((t && t.app && t.app.views && t.app.views.engine) ?
            t.app.views.engine.module(t.app.views.engine.options)
                .then(r => { this._renderer = r }) :
            Bluebird.resolve())
            .then(() => Bluebird.reduce(this._modules, (_, m) => m.views()));

    }

    link(app: express.Application): Bluebird<void> {

        return Bluebird.reduce(this._modules, (_, m) => m.link(this._app))
            .then(() => { app.use(`/${this.name}`, this._app) });

    }

    /**
      * init this module
      */
    init(a: Application<C>): Bluebird<Module<C>> {

        this._application = a;

        return this
            .submodules()
            .then(() => this.connections())
            .then(() => this.middleware())
            .then(() => this.routes())
            .then(() => this.views())
            .then(() => this.link(express()))
            .then(() => this);

    }

}

const defaults = {
    port: 2407,
    host: '0.0.0.0'
};

/**
 * Application is the main class of the framework.
 */
export class Application<C> {

    public express: express.Application = express();
    public server: ManagedServer;

    constructor(public main: Module<C>) { }

    start(): Bluebird<Application<C>> {

        return this.main.init(this)
            .then(() => {

                let opts = (<any>Object).assign({}, defaults, this.main.getConf().tendril.server);

                this.server = new ManagedServer(
                    opts.port,
                    opts.host,
                    http.createServer(this.main.getExpressApp()));

                return this.server.start();

            })
            .then(() => this);

    }

}

