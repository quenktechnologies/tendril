import * as express from 'express';

import { Type } from '@quenk/noni/lib/data/type';
import { Record } from '@quenk/noni/lib/data/record';
import { Path } from '@quenk/noni/lib/io/file';

import { Mutable } from '@quenk/potoo/lib/actor/framework/resident';
import { Runtime } from '@quenk/potoo/lib/actor/system/vm/runtime';
import { Address } from '@quenk/potoo/lib/actor/address';
import { SPAWN_CONCERN_STARTED } from '@quenk/potoo/lib/actor/template';

import { Filter, mkRequestMessage } from '../api/request';
import { Connection } from '../connection/pool';
import { App } from '../';
import { Middleware } from '../middleware';
import { FilterChain, FullStaticDirConf, RouteConf } from '../conf';
import { ModuleConf } from './conf';
import { ERROR_TOKEN_INVALID } from '../startup/csrf';

/**
 * ModuleInfo holds all the internal runtime information about a Module within
 * the application.
 *
 * This interface is separate from the main Module class to allow for use
 * without the actor specific properties from potoo.
 */
export interface ModuleInfo {
    /**
     * path the module's routes are to be mounted at.
     */
    path: Path;

    /**
     * address the module received from the potoo VM.
     */
    address: Address;

    /**
     * module instance (active one).
     */
    module: Module;

    /**
     * parent of this ModuleInfo.
     *
     * If missing indicates the ModuleInfo is the root.
     */
    parent?: ModuleInfo;

    /**
     * ancestors (direct) of the ModuleInfo.
     */
    ancestors: ModuleInfo[];

    /**
     * conf object used to create the module.
     */
    conf: ModuleConf;

    /**
     * express app for the module.
     */
    express: express.Application;

    /**
     * connections available to the module.
     */
    connections: Record<Connection>;

    /**
     * routing configured for the module.
     */
    routing: RoutingInfo;
}

/**
 * isMain tests if a ModuleInfo is the main module.
 */
export const isMain = (mod: ModuleInfo) => mod.parent === undefined;

/**
 * RoutingInfo holds all the Module's routing information.
 */
export interface RoutingInfo {
    /**
     * middleware (express) that will be installed and executed for each
     * request is handled.
     *
     * Due to how express works, these are inherited by child modules.
     */
    middleware: { available: Map<string, Middleware>; enabled: Middleware[] };

    /**
     * globalFilters serve as application level middleware and are executed
     * before each request is handled.
     *
     * These are also inherited by child modules.
     */
    globalFilters: Filter[];

    /**
     * handlers are used when certain error conditions are encountered such
     * as missing CSRF tokens or 404s.
     *
     * The key specifies the condition and the value is a chain of filters to
     * executed when the condition is met.
     *
     * These are inherited by child modules.
     */
    handlers: Record<Filter[]>;

    /**
     * dirs are the static directories that are served by the module.
     */
    dirs: Record<FullStaticDirConf[]>;

    /**
     * routes configured for the module.
     *
     * These specify which requests are actually valid for handling by the
     * application. They are not inherited by child modules.
     */
    routes: RouteConf[];
}

/**
 * Module is a contained unit of route and configuration data for a single
 * mount point in a tendril application.
 *
 * In tendril, an application is broken up into one more Modules that
 * represent the respective areas of concern. Modules are responsible
 * for configuring and handling their assigned routes (endpoints) in the
 * application and can spawn or child actors for one off or persistent tasks.
 */
export class Module extends Mutable {
    constructor(
        public app: App,
        public runtime: Runtime,
        public conf: ModuleConf
    ) {
        super(runtime);
    }

    address = this.runtime.self;

    /**
     * routeHandler given a final RouteConf, produces an express request handler
     * that executes each filter sequentially.
     */
    routeHandler =
        (route: RouteConf) =>
        (request: express.Request, response: express.Response) =>
            this.handleRequest(request, response, route.filters, route);

    errorHandler = async (
        err: Error,
        request: express.Request,
        response: express.Response,
        _: express.NextFunction
    ) => {
        if ((<Type>err).code === ERROR_TOKEN_INVALID) {
            if (this.conf?.app?.csrf?.on?.error) {
                this.handleRequest(request, response, [
                    this.conf.app.csrf.on.error
                ]);
            } else {
                response.status(404).send('Token invalid!');
            }
        } else {
            //TODO: this.getLogger().error(err);
            if (this.conf?.app?.routing?.on?.error) {
                let filter = this.conf.app.routing.on.error;
                this.handleRequest(request, response, [filter]);
            } else {
                response.status(500).send('Internal Server Error!');
            }
        }
    };

    noneHandler = async (
        request: express.Request,
        response: express.Response
    ) => {
        if (this.conf?.app?.routing?.on?.none) {
            this.handleRequest(request, response, [
                this.conf.app.routing.on.none
            ]);
        } else {
            response.status(404).send('Not Found');
        }
    };

    async handleRequest(
        request: express.Request,
        response: express.Response,
        filters: FilterChain,
        route?: RouteConf
    ) {
        await this.spawn(async actor => {
            let msg = mkRequestMessage(request, response, route);
            let ctx = {
                request: msg,
                framework: { request, response },
                actor
            };
            for (let filter of filters) {
                let res = await filter(ctx);
                if (res) {
                    res.send(response);
                    return;
                }
            }
            //TODO: Log warning, rasie event.
            console.warn(
                `The route handler for ${request.path} did not send a response!`
            );
            response.sendStatus(500);
        });
    }

    async run() {
        let { modules, children = [] } = this.conf;

        if (modules) {
            for (let [id, conf] of Object.entries(modules)) {
                conf = { ...conf, id };
                await this.spawn({
                    ...conf,
                    spawnConcern: SPAWN_CONCERN_STARTED,
                    create: runtime => {
                        let mod = new Module(this.app, runtime, conf);
                        this.app.registerModule(mod);
                        return mod;
                    }
                });
            }
        }

        for (let child of children) await this.spawn(child);
    }
}
