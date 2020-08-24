import * as express from 'express';
import { Type } from '@quenk/noni/lib/data/type';
import { Case } from '@quenk/potoo/lib/actor/resident/case';
import { Immutable } from '@quenk/potoo/lib/actor/resident';
import { Filter, ErrorFilter } from '../api/request';
import { App } from '../';
/**
 * Messages supported by modules.
 */
export declare type Messages<M> = Disable | Enable | Redirect | M;
/**
 * Path
 */
export declare type Path = string;
/**
 * Method
 */
export declare type Method = string;
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
    filters: Filter<void>[];
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
     * routes is the [[RoutingTable]] for those Filters that are executed based
     * on the incomming request.
     */
    routes: RoutingTable;
}
/**
 * RoutingTable contains route configuration for each path and supported method
 * in the module.
 *
 * The structure here is path.method = Filter[].
 */
export interface RoutingTable {
    [key: string]: {
        [key: string]: Filter<Type>[];
    };
}
/**
 * Disable a Module.
 *
 * All requests to the Module will 404.
 */
export declare class Disable {
}
/**
 * Enable a Module.
 */
export declare class Enable {
}
/**
 * Redirect requests to the module to another location.
 */
export declare class Redirect {
    status: number;
    location: string;
    constructor(status: number, location: string);
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
export declare class Module extends Immutable<Messages<any>, App> {
    app: App;
    routeInfo: RoutingInfo;
    constructor(app: App, routeInfo?: RoutingInfo);
    receive: Case<Messages<void>>[];
    /**
     * runInContext given a list of filters, produces an
     * express request handler where the action is the
     * interpretation of the filters.
     */
    runInContext: <A>(filters: Filter<A>[]) => express.RequestHandler;
    /**
     * runInContextWithError is used when an error occurs during request
     * handling.
     */
    runInContextWithError: (filter: ErrorFilter) => express.ErrorRequestHandler;
    /**
     * addBefore adds filters to the RoutingInfo that will be executed
     * before every route.
     */
    addBefore(filter: Filter<Type>): Module;
    /**
     * addRoute to the internal routing table of this Module.
     *
     * The routing table is only a cache and must be installed to an
     * [[express.Application]] in order to take effect.
     */
    addRoute(method: Method, path: Path, filters: Filter<Type>[]): Module;
    /**
     * addRoutes
     * @deprecated
     */
    addRoutes(routes: RouteConf[]): Module;
    disable(): void;
    enable(): void;
    redirect(location: string, status: number): void;
    /**
     * show constructrs a Filter for displaying a view.
     */
    show(name: string, ctx?: object): Filter<undefined>;
    /**
     * getRouter provides the [[express.Router]] for the Module.
     */
    getRouter(): express.Router;
    run(): void;
}
