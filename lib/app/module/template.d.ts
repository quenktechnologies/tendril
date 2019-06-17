import * as T from '@quenk/potoo/lib/actor/template';
import * as server from '../../net/http/server';
import * as show from '../../app/show';
import * as app from './conf/app';
import * as conn from './conf/connection';
import * as spawn from './conf/spawn';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { ModuleData } from '../actor/context';
import { Middlewares } from '../middleware';
import { Connections } from '../connection';
import { Module } from '../module';
import { App } from '../';
/**
 * Template for spawning a Module.
 */
export interface Template<S extends App> extends T.Template<S> {
    /**
     * disabled indicates whether the module should be disabled or not.
     */
    disabled?: boolean;
    /**
     * create a Module.
     *
     * Overrides the base function to specifically provide a module.
     */
    create: (s: S) => Module;
    /**
     * spawn child actors using the declerative API.
     *
     * The ids of these actors are computed from their key values.
     */
    spawn?: spawn.SpawnConfs;
    /**
     * server configuration settings.
     */
    server?: server.Configuration;
    /**
     * connections configuration settings.
     */
    connections?: conn.ConnectionConfs;
    /**
     * app configuration settings.
     */
    app?: app.AppConf<S>;
}
/**
 * getAvailableMiddleware extracts a map of available middleware
 * from a Template.
 */
export declare const getAvailableMiddleware: (t: Template<App>) => Middlewares;
/**
 * getEnabledMiddleware extracts the list of enabled middleware.
 */
export declare const getEnabledMiddleware: (t: Template<App>) => string[];
/**
 * getRoutes provides the route function from a Template.
 */
export declare const getRoutes: (t: Template<App>) => import("./conf/routes").Routes;
/**
 * getShowFun provides the "show" function of a Template.
 *
 * If not specified, the parent show function is used.
 */
export declare const getShowFun: (t: Template<App>, parent: Maybe<ModuleData>) => Maybe<show.Show>;
/**
 * getServerConf provides the server configuration for the app.
 */
export declare const getServerConf: (t: Template<App>, defaults: server.Configuration) => server.Configuration;
/**
 * getHooks provides the hook handlers configuration from a template.
 */
export declare const getHooks: (t: Template<App>) => import("./conf/hooks").HookConf<App>;
/**
 * getConnections provides the connections from a template.
 */
export declare const getConnections: (t: Template<App>) => Connections;
