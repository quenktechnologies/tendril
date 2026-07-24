import { Method } from './request';
import { RouteConf } from '../conf';

import { Path } from '@quenk/noni/lib/io/file';

export const ROUTE_METADATA_KEY = Symbol('tendril.routes');

/**
 * DecoratedRouteController is any class that has been decorated
 * to embed routing metadata in the constructor.
 */
export interface DecoratedRouteController {
    [ROUTE_METADATA_KEY]?: MappedRouteConfs;
}

/**
 * RouteDecoratorOptions are used to configure the routing decoraters.
 */
export interface RouteDecoratorOptions
    extends Omit<Partial<RouteConf>, 'method' | 'path' | 'handler'> {}

export type MappedRouteConfs = Map<string, RouteConf>;

/**
 * Get declares a method as a handler for HTTP GET requests at the given path.
 *
 * Usage:
 *   class MyController {
 *     @Get('/users/:id')
 *     async getUser(ctx: RequestContext): Promise<Response> { ... }
 *   }
 *
 * @param path    - The route path (e.g. '/users/:id').
 * @param options - Either a status code number or a RouteDecoratorOptions object.
 */
export const Get = (path: Path, options: RouteDecoratorOptions = {}) =>
    routeDecorator('get', path, options);

/**
 * Post declares a method as a handler for HTTP POST requests at the given path.
 *
 * Usage:
 *
 * ```
 *  @Post('/users', { filters: [] })
 *     async createUser(ctx: RequestContext): Promise<Response> { ... }
 *  }
 *```
 *
 * @param path    - The route path (e.g. '/users').
 * @param options - Either a status code number or a RouteDecoratorOptions object.
 */
export const Post = (path: Path, options: RouteDecoratorOptions = {}) =>
    routeDecorator('post', path, options);

/**
 * Put declares a method as a handler for HTTP PUT requests at the given path.
 *
 * @param path    - The route path (e.g. '/users/:id').
 * @param options - Either a status code number or a RouteDecoratorOptions object.
 */
export const Put = (path: Path, options: RouteDecoratorOptions = {}) =>
    routeDecorator('put', path, options);

/**
 * Patch declares a method as a handler for HTTP PATCH requests at the given path.
 *
 * @param path    - The route path (e.g. '/users/:id').
 * @param options - Either a status code number or a RouteDecoratorOptions object.
 */
export const Patch = (path: Path, options: RouteDecoratorOptions = {}) =>
    routeDecorator('patch', path, options);

/**
 * Delete declares a method as a handler for HTTP DELETE requests at the given path.
 *
 * @param path    - The route path (e.g. '/users/:id').
 * @param options - Either a status code number or a RouteDecoratorOptions object.
 */
export const Delete = (path: Path, options: RouteDecoratorOptions = {}) =>
    routeDecorator('delete', path, options);

const routeDecorator =
    (method: Method, path: Path, options: RouteDecoratorOptions) =>
    (f: Function, context: ClassMethodDecoratorContext): void => {
        context.addInitializer(function (this: unknown) {
            let existing =
                (this as DecoratedRouteController)[ROUTE_METADATA_KEY] ??
                new Map();

            existing.set(`${method}:${path}`, {
                ...options,
                method,
                path,
                handler: f.bind(this)
            });

            (this as DecoratedRouteController)[ROUTE_METADATA_KEY] = existing;
        });
    };

/**
 * getRouteConfFromMetadata generates a RouteConf list from an object whose
 * constructor has route metadata embedded.
 */
export const getRouteConfFromMetadata = (
    instance: DecoratedRouteController
): RouteConf[] => {
    let meta = instance[ROUTE_METADATA_KEY] ?? new Map();
    return [...meta.values()];
};
