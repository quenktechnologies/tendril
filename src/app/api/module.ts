import { isFunction } from '@quenk/noni/lib/data/type';

import { ModuleConf } from '../conf';
import { DecoratedRouteController, getRouteConfFromMetadata } from './routing';

export const MODULE_METADATA_KEY = Symbol('tendril.module');

export interface DecoratedModuleControllerConstructor {
    [MODULE_METADATA_KEY]?: ModuleConf;
}

/**
 * DecoratedModuleControllerConstructor types the constructor for classes that
 * have been decorated with @Module.
 */ export interface DecoratedModuleController {
    constructor: DecoratedModuleControllerConstructor;
}

/**
 * Module is a class decorator that marks a class as a tendril module optionally
 * attaching a ModuleConf at MODULE_METDATA_KEY to instances.
 *
 * Usage:
 *   @Module({ app: { path: '/api' } })
 *   class ApiModule { ... }
 *
 *   // or without options:
 *   @Module()
 *   class RootModule { ... }
 *
 * @param conf - Optional ModuleConf to associate with the class.
 */
export const Module =
    (conf: ModuleConf = {}) =>
    (target: unknown, _context: ClassDecoratorContext): void => {
        (target as DecoratedModuleControllerConstructor)[MODULE_METADATA_KEY] =
            conf;
    };

/**
 * getModuleConfFromMetadata retrieves the ModuleConf stored on classes
 * decorated by @Module.
 *
 * This also fetches and merges in routes that were declared via @Get,@Post etc.
 * It's important to use one of but not both methods of declaring routes, that
 * is to say either as part of @Module() options or directly via @Get etc.
 *
 * Mixing both can lead to unexpected results.
 */
export const getModuleConfFromMetadata = (
    target: DecoratedModuleController
): ModuleConf => {
    const mod: ModuleConf = target.constructor[MODULE_METADATA_KEY] ?? {};

    const routes = getRouteConfFromMetadata(target as DecoratedRouteController);

    return {
        ...mod,
        app: {
            ...mod.app,
            routing: {
                ...mod.app?.routing,
                routes: m => {
                    let list = isFunction(mod.app?.routing?.routes)
                        ? mod.app.routing.routes(m)
                        : [];
                    return [...list, ...routes];
                }
            }
        }
    };
};
