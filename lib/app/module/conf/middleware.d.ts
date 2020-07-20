import { Type } from '@quenk/noni/lib/data/type';
import { Middleware } from '../../middleware';
/**
 * MiddlewareProvider is a function that provides Middleware.
 */
export declare type MiddlewareProvider = (...options: Type[]) => Middleware;
/**
 * AvailableMiddleware declares the middleware that can be configured and
 * used.
 */
export interface AvailableMiddleware {
    [key: string]: MiddlewareConf;
}
/**
 * MiddlewareConf allows express middleware to be configured for a module.
 */
export interface MiddlewareConf {
    /**
     * provider for the middleware.
     */
    provider: MiddlewareProvider;
    /**
     * options to pass to the provider.
     */
    options?: Type[];
}
