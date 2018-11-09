import * as express from 'express';
import * as context from '@quenk/potoo/lib/actor/context';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Address } from '@quenk/potoo/lib/actor/address';
import { State, get } from '@quenk/potoo/lib/actor/system/state';
import { Hooks } from '../hooks';
import { Routes } from '../configuration';
import { Show } from '../show';
import { Module as M } from '../module';
import { Connections } from '../connection';
import { Middlewares } from '../middleware';

/**
 * Context used for actor entries in the Application.
 */
export interface Context extends context.Context {

    /**
     * module contains module specific context information
     * for actors that are also modules.
     */
    module: Maybe<Module>

}

/**
 * Module stores information related to modules.
 */
export interface Module {

    /**
     * path is the mount point of the module.
     */
    path: string,

    /**
     * parent context for this context.
     */
    parent: Maybe<Module>,

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
    hooks: Hooks,

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

}

/**
 * getModule provides a module given an address.
 */
export const getModule =
    (s: State<Context>, addr: Address): Maybe<Module> =>
        get(s, addr).chain((c: Context) => c.module);
