import { join } from 'path';

import { isString } from '@quenk/noni/lib/data/type';

import { BaseStartupTask } from './';
import { isMain, ModuleInfo } from '../module';
import { Middleware } from '../middleware';

/**
 * BuildGlobalFilters stage builds the routing.globalFilters list for each module.
 *
 * Global filters are inherited from the ancestors of a module as well as any
 * explicitly set on the module.
 */
export class BuildGlobalFilters extends BaseStartupTask {
    name = 'routing.build-global-filters';

    async execute(mod: ModuleInfo) {
        for (let ancestor of [mod, ...mod.ancestors]) {
            if (ancestor.conf.app?.filters) {
                mod.routing.globalFilters = [
                    ...mod.routing.globalFilters,
                    ...ancestor.conf.app.filters
                ];
            }
        }
    }
}

/**
 * BuildRouteFilters populates the routes from the module's configuration.
 *
 * Note: The globalFilters list is added here to each route's list of filters.
 */
export class BuildRouteFilters extends BaseStartupTask {
    name = 'routing.build-route-filters';

    async execute(mod: ModuleInfo) {
        let routes = mod.conf?.app?.routing?.routes
            ? mod.conf.app.routing.routes(mod)
            : [];

        mod.routing.routes = routes.map(route => ({
            ...route,
            filters: [...mod.routing.globalFilters, ...route.filters]
        }));
    }
}

/**
 * BuildAvailableMiddleware stage builds a map of middleware available.
 *
 * Modules can only use its own available middleware or one from an ancestor.
 */
export class BuildAvailableMiddleware extends BaseStartupTask {
    name = 'routing.build-available-middleware';

    async execute(mod: ModuleInfo) {
        let mwares = mod.routing.middleware.available;

        for (let ancestor of [mod, ...mod.ancestors]) {
            if (ancestor.conf.app?.middleware?.available) {
                for (let [name, { provider, options = [] }] of Object.entries(
                    ancestor.conf.app.middleware.available
                )) {
                    if (!mwares.has(name)) {
                        // Do not override child middleware.
                        mwares.set(name, provider.apply(null, options));
                    }
                }
            }
        }
    }
}

/**
 * BuildEnabledMiddleware resolves the list of middleware specified in a module
 * to the respective middleware handlers.
 *
 * This fails if any of the middleware are not found.
 */
export class BuildEnabledMiddleware extends BaseStartupTask {
    name = 'routing.enabled-middleware';

    async execute(mod: ModuleInfo) {
        let mwares = mod.routing.middleware.available;
        if (mod.conf.app?.middleware?.enabled) {
            mod.routing.middleware.enabled =
                mod.conf.app.middleware.enabled.map(ref => {
                    if (isString(ref)) {
                        if (!mwares.has(ref)) {
                            //TODO: This should not throw, instead we should log a warning or
                            //exit gracefully.
                            throw new Error(
                                `Module ${mod.address} references unknown middleware "${ref}"!`
                            );
                        }
                        return <Middleware>mwares.get(ref);
                    }

                    return ref;
                });
        }
    }
}

/**
 * ConfigureRoutes sets up the routing for a module.
 *
 * This is meant to be the final step in the routing process and involes
 * the following steps (in order):
 *
 * 1. install middleware (express)
 * 2. install globalFilters
 * 3. install routes
 * 4. mount child module to parent module (child modules only).
 */
export class ConfigureRoutes extends BaseStartupTask {
    name = 'routing.configure-routes';

    async execute(mod: ModuleInfo) {
        let app = mod.express;

        for (let mware of mod.routing.middleware.enabled) app.use(mware);

        for (let route of mod.routing.routes) {
            app[<'get'>route.method](
                route.path,
                mod.module.routeHandler(route)
            );
        }

        if (mod.parent) {
            let path = mod.conf.app?.path ?? mod.path;
            mod.parent.express.use(join('/', path), app);
        }
    }
}

/**
 * ConfigureFinalRoutes sets up the final routing for a module.
 *
 * This adds the error and 404 handlers. These must be added last to
 * ensure the other routes are actually triggered.
 */
export class ConfigureFinalRoutes extends BaseStartupTask {
    name = 'routing.configure-final-routes';

    async execute(mod: ModuleInfo) {
        if (!isMain(mod)) return;

        let app = mod.express;

        if (mod.conf?.app?.routing?.on?.none) app.use(mod.module.noneHandler);

        if (mod.conf?.app?.routing?.on?.error) app.use(mod.module.errorHandler);
    }
}
