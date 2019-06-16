import * as system from '@quenk/potoo/lib/actor/system/configuration';
import * as hooks from './hooks';
import * as show from './show';
import * as template from './module/template';
import * as mid from './middleware';
import * as mod from './module';
import { App } from './';

/**
 * Routes function is used to install application routes.
 */
export type Routes = (m: mod.Module) => void;

/**
 * MiddlewareProvider
 */
export type MiddlewareProvider = (...options: any[]) => mid.Middleware;

/**
 * ShowProvider of a Show.
 */
export type ShowProvider = (...options: any[]) => show.Show;

/**
 * Configuration for the application.
 */
export interface Configuration<S extends App> {

    system?: system.Configuration,

    on?: hooks.Hooks,

    middleware?: {

        available?: AvailableMiddleware,

        enabled?: string[]

    },

    routes?: Routes,

    views?: Show,

    modules?: Modules<S>

}

/**
 * AvaliableMiddleware section
 */
export interface AvailableMiddleware {

    [key: string]: Middleware

}

/**
 * Middleware definition.
 */
export interface Middleware {

    provider: MiddlewareProvider,

    options?: any[]

}

/**
 * Show section.
 */
export interface Show {

    provider: ShowProvider,

    options?: any[]

}

/**
 * Modules section
 */
export interface Modules<S extends App> {

    [key: string]: template.Template<S>

}
