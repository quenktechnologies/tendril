import * as express from 'express';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Record } from '@quenk/noni/lib/data/record';
import { Address } from '@quenk/potoo/lib/actor/address';
import { HookConf } from '../module/conf/hooks';
import { Routes } from '../module/conf/routes';
import { Show } from '../show';
import { Connections } from '../connection';
import { Middlewares } from '../middleware';
import { App } from '../';
import { Module as M } from './';
import { Template } from './template';
/**
 * LookupFunc is a function applied to a ModuleData to retrieve a desired
 * value.
 */
export declare type LookupFunc<T> = (mData: ModuleData) => LookupResult<T>;
/**
 * LookupResult is either the value desired or undefined if not found.
 */
export declare type LookupResult<T> = T | undefined;
/**
 * ModuleDatas map.
 */
export interface ModuleDatas extends Record<ModuleData> {
}
/**
 * ModuleData stores information about modules in the app.
 */
export interface ModuleData {
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
    parent: Maybe<ModuleData>;
    /**
     * module instance
     */
    module: M;
    /**
     * template used to spawn the module.
     */
    template: Template<App>;
    /**
     * app (express) for the module.
     */
    app: express.Application;
    /**
     * hooks installed for the module.
     */
    hooks: HookConf<App>;
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
export declare const getModule: (data: ModuleDatas, addr: Address) => Maybe<ModuleData>;
/**
 * getValue from a ModuleData looking up the value on the parent recursively
 * if not found on first try.
 *
 * Think of this function as prototype inheritance for tendril ModuleDatas.
 */
export declare const getValue: <T>(mData: ModuleData, f: LookupFunc<T>) => LookupResult<T>;
