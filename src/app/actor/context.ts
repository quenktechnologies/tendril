import * as express from 'express';
import * as context from '@quenk/potoo/lib/actor/context';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Address } from '@quenk/potoo/lib/actor/address';
import { State, get } from '@quenk/potoo/lib/actor/system/state';
import { HookConf } from '../module/conf/hooks';
import { Routes } from '../module/conf/routes';
import { Show } from '../show';
import { Module as M } from '../module';
import { Connections } from '../connection';
import { Middlewares } from '../middleware';
import { App } from '../';

/**
 * Context used for actor entries in the Application.
 */
export interface Context extends context.Context {

    /**
     * module contains module specific context information
     * for actors that are also modules.
     */
    module: Maybe<ModuleData>

}

/**
 * ModuleData stores information related to modules.
 */
export interface ModuleData {

    /**
     * path is the mount point of the module.
     */
    path: string,

    /**
     * address of the module in the system.
     */
    address: Address,

    /**
     * parent context for this context.
     */
    parent: Maybe<ModuleData>,

    /**
     * module instance
     */
    module: M

    /**
     * app (express) for the module.
     */
    app: express.Application,

    /**
     * hooks installed for the module.
     */
    hooks: HookConf<App>,

    /**
     * middleware configuration for the module.
     */
    middleware: { enabled: string[], available: Middlewares },

    /**
     * routes (express) for the module.
     */
    routes: Routes,

    /**
     * show function configured for the module (if any).
     */
    show: Maybe<Show>,

    /**
     * connections belonging to the module.
     */
    connections: Connections

    /**
     * disabled indicates whether the routes of the module should be
     * served or not.
     */
    disabled: boolean,

    /**
     * redirect if set will force redirect all requests to
     * the module's routes.
     */
    redirect: Maybe<{ status: number, location: string }>

}

/**
 * getModule provides a module given an address.
 */
export const getModule =
    (s: State<Context>, addr: Address): Maybe<ModuleData> =>
        get(s, addr).chain((c: Context) => c.module);
