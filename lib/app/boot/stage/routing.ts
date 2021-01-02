import { join } from 'path';

import { Future, attempt } from '@quenk/noni/lib/control/monad/future';
import { Type } from '@quenk/noni/lib/data/type';
import { map } from '@quenk/noni/lib/data/record';
import { just, Maybe } from '@quenk/noni/lib/data/maybe';

import { Template } from '../../module/template';
import { Filter } from '../../api/request';
import { ModuleData, ModuleDatas } from '../../module/data';
import { Stage } from './';

/**
 * RoutingStage sets up all the Application routing in one go.
 */
export class RoutingStage implements Stage {

    constructor(public modules: ModuleDatas) { }

    name = 'routing';

    execute(): Future<void> {

        let { modules } = this;

        return <Future<void>>attempt(() => map(modules, mconf => {

            let mod = mconf.module;
            let exApp = mconf.app;
            let routes = mconf.routes(mod);
            let temp: Template = <Template><Type>mconf.template;

            let filters = getConfFilters(just(mconf));
            if (filters.length > 0) {

                // Add the module level filters before each filter.
                mod.addRoutes(routes.map(r => ({

                    method: r.method,

                    path: r.path,

                    filters: <Filter<undefined>[]>[...filters, ...r.filters]

                })));

            } else {

                mod.addRoutes(routes);

            }

            exApp.use(mod.getRouter());

            if (temp.app && temp.app.on && temp.app.on.notFound)
                exApp.use(mod.runInContext([temp.app.on.notFound]));

            if (temp.app && temp.app.on && temp.app.on.internalError)
                exApp.use(mod.runInContextWithError(temp.app.on.internalError));

            if (mconf.parent.isJust()) {

                let parentExpApp = mconf.parent.get().app;
                parentExpApp.use(join('/', mconf.path), exApp);

            }

        })).map(() => undefined);

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
        let temp: Template = <Template><Type>target.template;

        if (temp.app && temp.app.filters)
            filters.push.apply(filters, temp.app.filters);

        current = target.parent;

    }

    return filters.reverse();

}
