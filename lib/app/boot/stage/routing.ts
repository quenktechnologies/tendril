import { join } from 'path';

import { Future, attempt } from '@quenk/noni/lib/control/monad/future';
import { Type } from '@quenk/noni/lib/data/type';
import { map } from '@quenk/noni/lib/data/record';

import { Template } from '../../module/template';
import { Filter } from '../../api/request';
import { ModuleDatas } from '../../module/data';
import { App } from '../../';
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
            let temp: Template<App> = <Template<App>><Type>mconf.template;

            if (temp.app && temp.app.filters) {

                let filters = temp.app.filters;

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
