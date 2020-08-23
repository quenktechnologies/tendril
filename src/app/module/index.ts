import * as express from 'express';

import { Type } from '@quenk/noni/lib/data/type';
import { just, nothing } from '@quenk/noni/lib/data/maybe';
import { Case } from '@quenk/potoo/lib/actor/resident/case';
import { Immutable } from '@quenk/potoo/lib/actor/resident';

import { getModule } from '../module/data';
import { Request, Filter, ErrorFilter } from '../api/request';
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
 * RouteConf describes a route to be installed in the application.
 */
export interface RouteConf {

    /**
     * method of the route.
     */
    method: string,

    /**
     * path of the route.
     */
    path: string,

    /**
     * filters applied when the route is executed.
     */
    filters: Filter<void>[]

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
export class Module extends Immutable<Messages<any>, App> {

    constructor(
        public app: App,
        public routes: RouteConf[] = []) { super(app); }

    receive: Case<Messages<void>>[] = <Case<Messages<void>>[]>[

        new Case(Disable, () => this.disable()),

        new Case(Enable, () => this.enable()),

        new Case(Redirect, (r: Redirect) => this.redirect(r.location, r.status))

    ];

    /**
     * runInContext given a list of filters, produces an
     * express request handler where the action is the
     * interpretation of the filters.
     */
    runInContext = <A>(filters: Filter<A>[]): express.RequestHandler => (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction) => {

        new RequestContext(this, req, res, next, filters.slice()).run()

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

            new RequestContext(this, req, res, next,
                [(r: Request) => filter(err, r)]).run();

        }

    /**
     * addRoutes to the list of routes for this module.
     *
     * This method only adds the routes to the cache. To actually enable them,
     * installRoutes() should be called.
     */
    addRoutes(routes: RouteConf[]): Module {

        this.routes = this.routes.concat(routes);
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
     * installRoutes of the Module into an [[express.Application]] instance.
     */
    installRoutes(app: express.Application): void {

        this.routes.forEach(({ path, method, filters }) =>
            (<Type>app)[method](path, this.runInContext(filters)));

    }

    run() { }

}
