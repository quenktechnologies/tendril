import * as T from '@quenk/potoo/lib/actor/template';
import * as server from '../../net/http/server';
import * as show from '../../app/show';
import * as app from './conf/app';
import * as conn from './conf/connection';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { ModuleData } from '../module/data';
import { Middlewares } from '../middleware';
import { Connections } from '../connection';
/**
 * Template for spawning a Module.
 */
export interface Template extends T.Template {
    /**
     * disabled indicates whether the module should be disabled or not.
     */
    disabled?: boolean;
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
    app?: app.AppConf;
}
/**
 * getAvailableMiddleware extracts a map of available middleware
 * from a Template.
 */
export declare const getAvailableMiddleware: (t: Template) => Middlewares;
/**
 * getEnabledMiddleware extracts the list of enabled middleware.
 */
export declare const getEnabledMiddleware: (t: Template) => string[];
/**
 * getRoutes provides the route function from a Template.
 */
export declare const getRoutes: (t: Template) => import("./conf/routes").Routes;
/**
 * getShowFun provides the "show" function of a Template.
 *
 * If not specified, the parent show function is used.
 */
export declare const getShowFun: (t: Template, parent: Maybe<ModuleData>) => Maybe<show.Show>;
/**
 * getServerConf provides the server configuration for the app.
 */
export declare const getServerConf: (t: Template, defaults: server.Configuration) => server.Configuration;
/**
 * getHooks provides the hook handlers configuration from a template.
 */
export declare const getHooks: (t: Template) => import("./conf/hooks").HookConf;
/**
 * getConnections provides the connections from a template.
 */
export declare const getConnections: (t: Template) => Connections;
