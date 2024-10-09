import { join } from 'path';

import { empty } from '@quenk/noni/lib/data/record';
import { just, Maybe } from '@quenk/noni/lib/data/maybe';

import { Filter } from '../../api/request';
import { ModuleData, ModuleDatas } from '../../module/data';
import { Stage } from './';

/**
 * RoutingStage sets up all the Application routing in one go.
 */
export class RoutingStage implements Stage {
    constructor(public modules: ModuleDatas) {}

    name = 'routing';

    async execute() {
        let { modules } = this;

        for (let mconf of Object.values(modules)) {
            let mod = mconf.module;
            let exApp = mconf.app;
            let routes = mconf.routes(mod);
            let temp = mconf.template;
            let filters = getConfFilters(just(mconf));

            if (!empty(filters)) {
                // Add the module level filters before each filter.
                mod.addRoutes(
                    routes.map(r => ({
                        ...r,

                        filters: <Filter<undefined>[]>[...filters, ...r.filters]
                    }))
                );
            } else {
                mod.addRoutes(routes);
            }

            exApp.use(mod.getRouter());

            if (temp.app && temp.app.on && temp.app.on.notFound)
                exApp.use(mod.runIn404Context(temp.app.on.notFound));

            if (temp.app && temp.app.on && temp.app.on.internalError)
                exApp.use(mod.runInContextWithError(temp.app.on.internalError));

            if (mconf.parent.isJust()) {
                let parentExpApp = mconf.parent.get().app;

                let path = temp?.app?.path || mconf.path;

                parentExpApp.use(join('/', path), exApp);
            }
        }
    }
}

/**
 * getConfFilters provides all the filters declared at the configuration
 * level.
 *
 * Filters from parent modules are inherited and are first in the list.
 */
const getConfFilters = (mdata: Maybe<ModuleData>): Filter<void>[] => {
    let filters = <Filter<void>[]>[];
    let current = mdata;

    while (current.isJust()) {
        let target = current.get();
        let temp = target.template;

        if (temp.app && temp.app.filters)
            filters = [...temp.app.filters, ...filters];

        current = target.parent;
    }

    return filters;
};
