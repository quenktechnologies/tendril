import * as express from 'express';
import * as context from '@quenk/potoo/lib/actor/context';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Address } from '@quenk/potoo/lib/actor/address';
import { State } from '@quenk/potoo/lib/actor/system/state';
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
    module: Maybe<Module>;
}
/**
 * Module stores information related to modules.
 */
export interface Module {
    /**
     * path is the mount point of the module.
     */
    path: string;
    /**
     * address of the module in the system.
     */
    address: Address;
    /**
     * parent context for this context.
     */
    parent: Maybe<Module>;
    /**
     * module instance
     */
    module: M;
    /**
     * app (express) for the module.
     */
    app: express.Application;
    /**
     * hooks installed for the module.
     */
    hooks: Hooks;
    /**
     * middleware configuration for the module.
     */
    middleware: {
        enabled: string[];
        available: Middlewares;
    };
    /**
     * routes (express) for the module.
     */
    routes: Routes;
    /**
     * show function configured for the module (if any).
     */
    show: Maybe<Show>;
    /**
     * connections belonging to the module.
     */
    connections: Connections;
    /**
     * disabled indicates whether the routes of the module should be
     * served or not.
     */
    disabled: boolean;
    /**
     * redirect if set will force redirect all requests to
     * the module's routes.
     */
    redirect: Maybe<{
        status: number;
        location: string;
    }>;
}
/**
 * getModule provides a module given an address.
 */
export declare const getModule: (s: State<Context>, addr: string) => Maybe<Module>;
