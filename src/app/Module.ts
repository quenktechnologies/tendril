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

        return this._modules.reduce((p, m) => p.then(() => m.submodules()), Bluebird.resolve());

    }

    initScripts(): Bluebird<void> {

        let t = this.configuration.tendril;
        let scripts = (t && t.app.on && t.app.on.init) ? t.app.on.init : [];
        let p = Bluebird.all(scripts.map(s => s(this)));

        return this
            ._modules
            .reduce((p, m) => p.then(() => m.initScripts()), p.then(() => { }))

    }

    connections(): Bluebird<void> {

        let t = this.configuration.tendril;
        let p: Bluebird<void | void[]>;

        let onConnected = (t && t.app.on && t.app.on.connected) ? t.app.on.connected : [];

        if (t && t.data && t.data.connections) {

            p = Bluebird
                .all(map(t.data.connections, (c, k) =>
                    c.connector(c.options).then(c => { data.Pool.add(k, c); })))
        } else {

            p = Bluebird.resolve();

        }

        return this
            ._modules
            .reduce((p, m) => p.then(() => m.connections()), p)
            .then(() => Bluebird.all(onConnected.map(f=>f(this))))
      .then(()=>{});

    }

    middleware(): Bluebird<void> {

        let t = this.configuration.tendril;
        let p: Bluebird<any>;

        if (t && t.app && t.app.middleware && t.app.middleware.enabled) {

            let available = t.app.middleware.available;

            p = Bluebird.try(() =>
                t.app.middleware.enabled.reduce((app, name) => {

                    if (available && available[name])
                        app.use(available[name].options ?
                            available[name].module(available[name].options) :
                            available[name].module)
                    else
                        throw new Error(`Unknown filter '${name}' in module '${this.name}'!`);

                    return app;

                }, this._app))

        } else {
            p = Bluebird.resolve();
        }
        return this._modules.reduce((p, m) => p.then(() => m.middleware()), p);

    }

    routes(): Bluebird<void> {

        return Bluebird.try(() => this.routeFn(this._app, this))
            .then(() =>
                this
                    ._modules
                    .reduce((p, m) => p.then(() => m.routes()), Bluebird.resolve()));

    }

    views(): Bluebird<void> {

        let t = this.configuration.tendril;

        return ((t && t.app && t.app.views && t.app.views.engine) ?
            t.app.views.engine.module(t.app.views.engine.options, this)
                .then(r => { this._renderer = r }) :
            Bluebird.resolve())
            .then(() =>
                this
                    ._modules
                    .reduce((p, m) => p.then(() => m.views()), Bluebird.resolve()));

    }

    link(app: express.Application): Bluebird<void> {

        return this._modules.reduce((p, m) => p.then(() => m.link(this._app)), Bluebird.resolve())
            .then(() => { app.use(`/${this.name}`, this._app) });

    }

    /**
      * init this module
      */
    init(a: Application<C>): Bluebird<Module<C>> {

        this._application = a;

        return this
            .submodules()
            .then(() => this.initScripts())
            .then(() => this.connections())
            .then(() => this.middleware())
            .then(() => this.routes())
            .then(() => this.views())
            .then(() => this.link(express()))
            .then(() => this);

    }

}

