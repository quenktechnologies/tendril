import * as hooks from './hooks';
import * as show from './show';
import * as template from './module/template';
import * as mid from './middleware';
import * as mod from './module';
/**
 * Routes function is used to install application routes.
 */
export declare type Routes = (m: mod.Module) => void;
/**
 * MiddlewareProvider
 */
export declare type MiddlewareProvider = (...options: any[]) => mid.Middleware;
/**
 * ShowProvider of a Show.
 */
export declare type ShowProvider = (...options: any[]) => show.Show;
/**
 * Configuration for the application.
 */
export interface Configuration {
    on?: hooks.Hooks;
    middleware?: {
        available?: AvailableMiddleware;
        enabled?: string[];
    };
    routes?: Routes;
    views?: Show;
    modules?: Modules;
}
/**
 * AvaliableMiddleware section
 */
export interface AvailableMiddleware {
    [key: string]: Middleware;
}
/**
 * Middleware definition.
 */
export interface Middleware {
    provider: MiddlewareProvider;
    options?: any[];
}
/**
 * Show section.
 */
export interface Show {
    provider: ShowProvider;
    options?: any[];
}
/**
 * Modules section
 */
export interface Modules {
    [key: string]: template.Template;
}
