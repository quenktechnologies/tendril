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
export interface RouteConf<A> {

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
    filters: Filter<A>[]

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
 * Module of the application.
 *
 * A tendril application breaks up it's routes and related code
 * into a series of modules. Each module is an actor with the
 * ability to send and receive messages.
 *
 * Most actions of a Module are implemented using Api classes that
 * are executed by the App.
 *
 * This makes debugging slightly easier as we can review to some extent what
 * individual modules are doing via the op log.
 */
export class Module extends Immutable<Messages<any>, App> {

    constructor(public system: App) { super(system); }

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
     * install routes into the routing table for this module.
     */
    install<A>(routes: RouteConf<A>[]): void {

        let maybeModule = getModule(this.system.modules, this.self());

        if (maybeModule.isJust()) {

            let m = maybeModule.get();

            routes.forEach(({ path, method, filters }) => {

                (<Type>m.app)[method](path, this.runInContext(filters));

            });

        }

    }

    disable() {

        getModule(this.system.modules, this.self())
            .map(m => { m.disabled = true; })
            .orJust(() => console.warn(`${this.self()}: Cannot be disabled!`))
            .get();

    }

    enable() {

        getModule(this.system.modules, this.self())
            .map(m => { m.disabled = false; m.redirect = nothing() })
            .orJust(() => console.warn(`${this.self()}: Cannot be enabled!`))
            .get();

    }

    redirect(location: string, status: number) {

        getModule(this.system.modules, this.self())
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

    run() { }

}
