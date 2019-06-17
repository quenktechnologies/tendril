import * as T from '@quenk/potoo/lib/actor/template';
import * as server from '../../net/http/server';
import * as show from '../../app/show';
import * as app from './conf/app';
import * as conn from './conf/connection';
import * as spawn from './conf/spawn';
import { Maybe, just, } from '@quenk/noni/lib/data/maybe';
import { merge, map, reduce } from '@quenk/noni/lib/data/record';
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
    disabled?: boolean,

    /**
     * create a Module.
     *
     * Overrides the base function to specifically provide a module.
     */
    create: (s: S) => Module,

    /**
     * spawn child actors using the declerative API.
     *
     * The ids of these actors are computed from their key values.
     */
    spawn?: spawn.SpawnConfs,

    /**
     * server configuration settings.
     */
    server?: server.Configuration,

    /**
     * connections configuration settings.
     */
    connections?: conn.ConnectionConfs,

    /**
     * app configuration settings.
     */
    app?: app.AppConf<S>,

}

/**
 * getAvailableMiddleware extracts a map of available middleware
 * from a Template.
 */
export const getAvailableMiddleware = (t: Template<App>): Middlewares =>
    (t.app && t.app.middleware && t.app.middleware.available) ?
        map(t.app.middleware.available, m =>
            m.provider.apply(null, m.options || [])) : {};

/**
 * getEnabledMiddleware extracts the list of enabled middleware.
 */
export const getEnabledMiddleware = (t: Template<App>) =>
    (t.app && t.app.middleware && t.app.middleware.enabled) ?
        t.app.middleware.enabled : [];

/**
 * getRoutes provides the route function from a Template.
 */
export const getRoutes = (t: Template<App>) =>
    (t.app && t.app.routes) ? t.app.routes : () => [];

/**
 * getShowFun provides the "show" function of a Template.
 *
 * If not specified, the parent show function is used.
 */
export const getShowFun = (t: Template<App>, parent: Maybe<ModuleData>)
    : Maybe<show.Show> =>
    (t.app && t.app.views) ?
        just(t.app.views.provider.apply(null, t.app.views.options || [])) :
        parent.chain(m => m.show);

/**
 * getServerConf provides the server configuration for the app.
 */
export const getServerConf =
    (t: Template<App>, defaults: server.Configuration): server.Configuration =>
        merge(defaults, (t.server == null) ? {} : t.server);

/**
 * getHooks provides the hook handlers configuration from a template.
 */
export const getHooks = (t: Template<App>) =>
    (t.app && t.app.on) ? t.app.on : {};

/**
 * getConnections provides the connections from a template.
 */
export const getConnections = (t: Template<App>): Connections => {

    if (t.connections == null) return {};

    return reduce(t.connections, <Connections>{}, (p, c, k) => {

        if (c.connector == null) return p;

        p[k] = (c.options != null) ?
            c.connector.apply(null, c.options) :
            c.connector();

        return p;

    });

}
