import * as express from 'express';
import * as context from '@quenk/potoo/lib/actor/context';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Actor } from '@quenk/potoo/lib/actor';
import { Template } from '@quenk/potoo/lib/actor/template';
import { State } from '@quenk/potoo/lib/actor/system/state';
import { Hooks } from '../hooks';
import { Routes } from '../configuration';
import { Show } from '../show';
import { Module } from '../module';
/**
 * Context used for actor entries in the Application.
 */
export interface Context extends context.Context {
    /**
     * module contains module specific context information
     * for actors that are also modules.
     */
    module: Maybe<ModuleContext>;
}
/**
 * ModuleContext stores information related to modules.
 */
export interface ModuleContext {
    /**
     * path is the mount point of the module.
     */
    path: string;
    /**
     * module instance
     */
    module: Module;
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
    middleware: string[];
    /**
     * routes (express) for the module.
     */
    routes: Routes;
    /**
     * show function configured for the module (if any).
     */
    show: Maybe<Show>;
}
/**
 * getModule provides a module given an address.
 */
export declare const getModule: (s: State<Context>, addr: string) => Maybe<ModuleContext>;
/**
 * newContext produces a new plain context.
 */
export declare const newContext: (module: Maybe<ModuleContext>, actor: Actor<Context>, template: Template<Context>) => Context;
