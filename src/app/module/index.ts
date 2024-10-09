import * as express from 'express';

import { Object } from '@quenk/noni/lib/data/jsonx';
import { Type } from '@quenk/noni/lib/data/type';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Record, forEach, merge } from '@quenk/noni/lib/data/record';

import { TypeCase } from '@quenk/potoo/lib/actor/framework';
import { Immutable } from '@quenk/potoo/lib/actor/framework/resident';
import { Runtime } from '@quenk/potoo/lib/actor/system/vm/runtime';

import { ERROR_TOKEN_INVALID } from '../boot/stage/csrf-token';
import { Template } from './template';
import { getModule, ModuleData } from '../module/data';
import { Request, Filter, ErrorFilter, ClientRequest } from '../api/request';
import { show } from '../api/response';
import { Context as RequestContext } from '../api';
import { App } from '../';

/**
 * Messages supported by modules.
 */
export type Messages<M> = Disable | Enable | Redirect | M;

/**
 * Path
 */
export type Path = string;

/**
 * Method
 */
export type Method = string;

/**
 * PathConf is an object where the key is a URL path and the value a
 * [[MethodConf]] object containing routes for the desired HTTP methods.
 */
export interface PathConf extends Record<MethodConf> {}

/**
 * MethodConf is an object where the key is a supported HTTP method and
 * the value the route configuration to use for that method.
 */
export interface MethodConf extends Record<RouteConf[]> {}

/**
 * RouteConf describes a route to be installed in the application.
 */
export interface RouteConf {
    /**
     * method of the route.
     */
    method: Method;

    /**
     * path of the route.
     */
    path: Path;

    /**
     * filters applied when the route is executed.
     */
    filters: Filter<Type>[];

    /**
     * tags is an object containing values set on the Request by the routing
     * configuration.
     *
     * These are useful for distinguishing what action take in common filters.
     */
    tags: Object;
}

/**
 * RoutingInfo holds all the Module's routing information.
 */
export interface RoutingInfo {
    /**
     * before is those Filters that will be executed before all others.
     */
    before: Filter<Type>[];

    /**
     * routes is the [[PathConf]] for those Filters that are executed based
     * on the incoming request.
     */
    routes: PathConf;
}

/**
 * Disable a Module.
 *
 * All requests to the Module will 404.
 */
export class Disable {}

/**
 * Enable a Module.
 */
export class Enable {}

/**
 * Redirect requests to the module to another location.
 */
export class Redirect {
    constructor(
        public status: number,
        public location: string
    ) {}
}

const defaultRouteInfo = () => ({ before: [], routes: {} });

/**
 * Module of a tendril application.
 *
 * In tendril, an application is broken up into one more Modules that
 * represent the respective areas of concern. Modules are responsible
 * for configuring and handling their assigned routes (endpoints) in the
 * application and can communicate with each other via the actor API.
 *
 * Think of all the routes of a Module as one big function that pattern
 * matches incoming requests.
 */
export class Module extends Immutable<Messages<Type>> {
    constructor(
        public app: App,
        public runtime: Runtime,
        public path: Path,
        public template: Template,
        public parent: Maybe<ModuleData> = Maybe.nothing(),
        public routeInfo: RoutingInfo = defaultRouteInfo()
    ) {
        super(runtime);
    }

    selectors() {
        return [
            new TypeCase(Disable, () => this.disable()),

            new TypeCase(Enable, () => this.enable()),

            new TypeCase(Redirect, (r: Redirect) =>
                this.redirect(r.location, r.status)
            )
        ];
    }

    /**
     * runInContext given a final RouteConf, produces an express request handler
     * that executes each filter sequentially.
     */
    runInContext =
        (route: RouteConf): express.RequestHandler =>
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            new RequestContext(
                this,
                ClientRequest.fromExpress(req, res, route),
                res,
                next,
                route.filters.slice()
            ).run();
        };

    /**
     * runIn404Context is used when a 404 handler filter is installed.
     */
    runIn404Context =
        (filter: Filter<Type>): express.RequestHandler =>
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) =>
            this.runInContext({
                method: req.method,

                path: '404',

                filters: [filter],

                tags: {}
            })(req, res, next);

    /**
     * runInContextWithError is used when an error occurs during request
     * handling.
     */
    runInContextWithError =
        (filter: ErrorFilter): express.ErrorRequestHandler =>
        (
            err: Error,
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            new RequestContext(
                this,
                ClientRequest.fromExpress(req, res, {
                    method: req.method,

                    path: '?',

                    filters: [],

                    tags: {}
                }),
                res,
                next,
                [(r: Request) => filter(err, r)]
            ).run();
        };

    /**
     * runInCSRFErrorContext is used for CSRF error handling.
     */
    runInCSRFErrorContext =
        (filters: Filter<Type>[]) =>
        (
            err: Error,
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            if ((<Type>err).code !== ERROR_TOKEN_INVALID) return next();

            this.runInContext({
                method: req.method,

                path: '?',

                filters,

                tags: {}
            })(<Type>req, res, next);
        };

    /**
     * addBefore adds filters to the RoutingInfo that will be executed
     * before every route.
     */
    addBefore(filter: Filter<Type>): Module {
        this.routeInfo.before.push(filter);
        return this;
    }

    /**
     * addRoute to the internal routing table of this Module.
     *
     * These routes are later installed to the result of getRouter().
     */
    addRoute(conf: RouteConf): Module {
        let { routes } = this.routeInfo;

        if (routes[conf.path] != null) {
            let route = routes[conf.path];
            if (route[conf.method] != null)
                route[conf.method] = [...route[conf.method], conf];
            else route[conf.method] = [conf];
        } else {
            routes[conf.path] = { [conf.method]: [conf] };
        }

        return this;
    }

    /**
     * addRoutes
     * @deprecated
     */
    addRoutes(routes: RouteConf[]): Module {
        routes.forEach(r => this.addRoute(r));
        return this;
    }

    disable() {
        getModule(this.app.modules, this.self)
            .map(m => {
                m.disabled = true;
            })
            .orJust(() => console.warn(`${this.self}: Cannot be disabled!`))
            .get();
    }

    enable() {
        getModule(this.app.modules, this.self)
            .map(m => {
                m.disabled = false;
                m.redirect = Maybe.nothing();
            })
            .orJust(() => console.warn(`${this.self}: Cannot be enabled!`))
            .get();
    }

    redirect(location: string, status: number) {
        getModule(this.app.modules, this.self)
            .map(m => {
                m.redirect = Maybe.just({ location, status });
            })
            .orJust(() => console.warn(`${this.self}: Cannot be enabled!`))
            .get();
    }

    /**
     * show constructors a Filter for displaying a view.
     */
    show(name: string, ctx?: object): Filter<undefined> {
        return () => show(name, ctx);
    }

    /**
     * getRouter provides the [[express.Router]] for the Module.
     */
    getRouter(): express.Router {
        let router = express.Router();
        let { before, routes } = this.routeInfo;

        forEach(routes, (methodConfs, path) => {
            forEach(methodConfs, (confs, method) => {
                let filters = before.slice();

                let tags = <Object>{};

                confs.forEach(conf => {
                    filters = [...filters, ...conf.filters];

                    tags = merge(tags, conf.tags);
                });

                (<Type>router)[method](
                    path,
                    this.runInContext({
                        method,

                        path,

                        filters,

                        tags
                    })
                );
            });
        });

        return router;
    }

    async run() {
        let { app, children = [] } = this.template;
        let moduleData = Maybe.fromNullable(
            this.app.registerModule(this.parent, this)
        );

        if (app && app.modules) {
            for (let [key, conf] of Object.entries(app.modules)) {
                let tmpl = conf(this.app);
                await this.spawn({
                    ...tmpl,
                    spawnConcern: 'receiving',
                    create: runtime =>
                        new Module(this.app, runtime, key, tmpl, moduleData)
                });
            }
        }

        for (let child of children) await this.spawn(child);
    }
}
