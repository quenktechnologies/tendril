import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Either } from '@quenk/noni/lib/data/either';
import { Path } from '@quenk/noni/lib/io/file';

import { Method, RequestContext } from './request';
import { RouteConf } from '../conf';
import {
    Response,
    Status,
    OK,
    conflict,
    notFound,
    error,
    fromStatusCode
} from './response';

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
    extends Omit<Partial<RouteConf>, 'method' | 'path' | 'handler'> {
    /**
     * status code to respond with when the handler resolves successfully
     * (a plain value, a Just, or a Right).
     *
     * Defaults to 200 (OK).
     */
    status?: Status;
}

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
                handler: dispatchHandler(this, f, options.status)
            });

            (this as DecoratedRouteController)[ROUTE_METADATA_KEY] = existing;
        });
    };

/**
 * dispatchHandler wraps a decorated method so it can focus on business logic
 * instead of constructing a Response.
 *
 * The wrapped function may return:
 * - a Response, which is sent unchanged.
 * - a Maybe, sent as 404 if Nothing, otherwise the Just value at `status`.
 * - an Either, sent as 409 with the Left value, otherwise the Right value at
 *   `status`.
 * - any other value, sent as the body at `status`.
 *
 * If the wrapped function throws or its Promise rejects, a 500 is sent with
 * the error as the body.
 */
const dispatchHandler = (
    instance: unknown,
    handler: Function,
    status: Status = OK
) => {
    return async (ctx: RequestContext): Promise<Response> => {
        try {
            let result = await handler.call(instance, ctx);

            if (result instanceof Response) return result;

            if (Maybe.is(result))
                return result.isJust()
                    ? fromStatusCode(status, result.get())
                    : notFound();

            if (Either.is(result))
                return result.isRight()
                    ? fromStatusCode(status, result.right())
                    : conflict(result.left());

            return fromStatusCode(status, result);
        } catch (e) {
            return error(e as Error);
        }
    };
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

/**
 * fromMetadata generates a RouteConf list from an object decorated with
 * @Get, @Post etc.
 *
 * Accepts any object, so callers don't need to declare it as a
 * DecoratedRouteController via interface merging.
 */
export const fromMetadata = (target: object): RouteConf[] =>
    getRouteConfFromMetadata(target as DecoratedRouteController);
