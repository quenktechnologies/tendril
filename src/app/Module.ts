import * as Bluebird from 'bluebird';
import * as express from 'express';
import * as data from '../data';
import * as conf from './Conf';
import { map } from 'afpl/lib/util';
import { Renderer, View } from './Renderer';
import { Application } from './Application';

export interface RouteFn<C> {

    (expressApp: express.Application, m: Module<C>): void

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
        public path: string,
        public configuration: conf.Conf<C>,
        public routeFn: RouteFn<C>) { }

    getApp(): Application<C> {

        return this._application;

    }

    getExpressApp(): express.Application {

        return this._app;

    }

    getConf(): conf.Conf<C> {

        return this.configuration;

    }

    onError(e: Error): void {

        let t = this.configuration.tendril;

        if (t && t.app && t.app.errors && t.app.errors.handler)
            return t.app.errors.handler(e, this);

        console.error(`${this.name}: error occured!`);
        console.error(e.stack ? e.stack : e);
        process.exit(-1);

    }

    render<A>(view: string, context?: A): Bluebird<View> {

        return (this._renderer) ?
            this._renderer.render(view, context) :
            Bluebird.reject(new Error(`No renderer configured for module '${this.name}'!`));

    }

    submodules(): Bluebird<void> {

        let t = this.configuration.tendril;

        if (t && t.app && t.app.modules)
            this._modules.push.apply(map(t.app.modules,
                (f, k) => this._modules.push(f(k))));

        return Bluebird
            .reduce(this._modules.slice(0, 1), (_: void, m: Module<C>) => m.submodules(), null)
            .then(() => Bluebird.resolve());

    }

    connections(): Bluebird<void> {

        let t = this.configuration.tendril;
        let p: Bluebird<void | void[]>;

        if (t && t.data && t.data.connections) {

            p = Bluebird
                .all(map(t.data.connections, (c, k) =>
                    c.connector(c.options).then(c => { data.Pool.add(k, c); })))
        } else {

            p = Bluebird.resolve();

        }

        return p
            .then(() => Bluebird
                .reduce(this._modules, (_, m) => m.connections(), null)
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

            }, null);

        } else {

            p = Bluebird.resolve();

        }

        return p.then(() => Bluebird
            .reduce(this._modules, (_, m) => m.middleware(), null)
            .then(() => Bluebird.resolve()));

    }

    routes(): Bluebird<void> {

        return Bluebird.try(() => this.routeFn(this._app, this))
            .then(() => Bluebird.reduce(this._modules, (_: void, m: Module<C>) => m.routes(), null));

    }

    views(): Bluebird<void> {

        let t = this.configuration.tendril;

        return ((t && t.app && t.app.views && t.app.views.engine) ?
            t.app.views.engine.module(t.app.views.engine.options, this)
                .then(r => { this._renderer = r }) :
            Bluebird.resolve())
            .then(() => Bluebird.reduce(this._modules, (_, m) => m.views(), null));

    }

    link(app: express.Application): Bluebird<void> {

        return Bluebird.reduce(this._modules, (_, m) => m.link(this._app), null)
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

