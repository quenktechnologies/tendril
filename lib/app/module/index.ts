import * as express from 'express';

import { Type } from '@quenk/noni/lib/data/type';
import { just, nothing } from '@quenk/noni/lib/data/maybe';
import { map } from '@quenk/noni/lib/data/record';
import { Case } from '@quenk/potoo/lib/actor/resident/case';
import { Immutable } from '@quenk/potoo/lib/actor/resident/immutable';

import { getModule } from '../module/data';
import { Request, Filter, ErrorFilter, ClientRequest } from '../api/request';
import { show } from '../api/response';
import { Context as RequestContext } from '../api';
import { App } from '../';

/**
 * Messages supported by modules.
 */
export type Messages<M>
    = Disable
    | Enable
    | Redirect
    | M
    ;

/**
 * Path
 */
export type Path = string;

/**
 * Method
 */
export type Method = string;

/**
 * RouteConf describes a route to be installed in the application.
 */
export interface RouteConf {

    /**
     * method of the route.
     */
    method: Method,

    /**
     * path of the route.
     */
    path: Path,

    /**
     * filters applied when the route is executed.
     */
    filters: Filter<void>[]

}

/**
 * RoutingInfo holds all the Module's routing information.
 */
export interface RoutingInfo {

    /**
     * before is those Filters that will be executed before all others.
     */
    before: Filter<Type>[],

    /**
     * routes is the [[RoutingTable]] for those Filters that are executed based
     * on the incomming request.
     */
    routes: RoutingTable

}

/**
 * RoutingTable contains route configuration for each path and supported method
 * in the module.
 *
 * The structure here is path.method = Filter[].
 */
export interface RoutingTable {

    [key: string]: {

        [key: string]: Filter<Type>[]

    }

}

/**
 * Disable a Module.
 *
 * All requests to the Module will 404.
 */
export class Disable { }

/**
 * Enable a Module.
 */
export class Enable { }

/**
 * Redirect requests to the module to another location.
 */
export class Redirect {

    constructor(public status: number, public location: string) { }

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
 * matches incomming requests.
 */
export class Module extends Immutable<Messages<any>> {

    constructor(
        public app: App,
        public routeInfo: RoutingInfo = defaultRouteInfo()) { super(app); }

    receive(): Case<Messages<void>>[] {

      return <Case<Messages<void>>[]>[

        new Case(Disable, () => this.disable()),

        new Case(Enable, () => this.enable()),

        new Case(Redirect, (r: Redirect) => this.redirect(r.location, r.status))

    ];

    }

    /**
     * runInContext given a list of filters, produces an
     * express request handler where the action is the
     * interpretation of the filters.
     */
    runInContext = <A>(filters: Filter<A>[]): express.RequestHandler => (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction) => {

        new RequestContext(
          this,
          ClientRequest.fromExpress(req),
          res,
          next,
          filters.slice()
        ).run()

    }

    /**
     * runInContextWithError is used when an error occurs during request 
     * handling.
     */
    runInContextWithError = (filter: ErrorFilter): express.ErrorRequestHandler =>
        (err: Error,
            req: express.Request,
            res: express.Response,
            next: express.NextFunction) => {

            new RequestContext(
              this,
              ClientRequest.fromExpress(req),
              res,
              next,
                [(r: Request) => filter(err, r)]
            ).run();

        }

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
     * The routing table is only a cache and must be installed to an 
     * [[express.Application]] in order to take effect.
     */
    addRoute(method: Method, path: Path, filters: Filter<Type>[]): Module {

        let { routes } = this.routeInfo;

        if (routes[path] != null) {

            let route = routes[path];

            if (route[method] != null)
                route[method] = [...route[method], ...filters];
            else
                route[method] = filters;

        } else {

            routes[path] = { [method]: filters };

        }

        return this;

    }

    /**
     * addRoutes
     * @deprecated
     */
    addRoutes(routes: RouteConf[]): Module {

        routes.forEach(r => this.addRoute(r.method, r.path, r.filters));
        return this;

    }

    disable() {

        getModule(this.app.modules, this.self())
            .map(m => { m.disabled = true; })
            .orJust(() => console.warn(`${this.self()}: Cannot be disabled!`))
            .get();

    }

    enable() {

        getModule(this.app.modules, this.self())
            .map(m => { m.disabled = false; m.redirect = nothing() })
            .orJust(() => console.warn(`${this.self()}: Cannot be enabled!`))
            .get();

    }

    redirect(location: string, status: number) {

        getModule(this.app.modules, this.self())
            .map(m => { m.redirect = just({ location, status }) })
            .orJust(() => console.warn(`${this.self()}: Cannot be enabled!`))
            .get();

    }

    /**
     * show constructrs a Filter for displaying a view.
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

        map(routes, (conf, path) => {

            map(conf, (filters, method) => {

                let allFilters = [...before, ...filters];
                (<Type>router)[method](path, this.runInContext(allFilters));

            });

        });

        return router;

    }

    run() { }

}
