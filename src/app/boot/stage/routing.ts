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

        return <Future<void>>attempt(() => map(modules, m => {

            let mod = m.module;
            let t: Template<App> = <Template<App>><Type>m.template;
            let routes = m.routes(m.module);

            if (t.app && t.app.filters) {

                let filters = t.app.filters;

                mod.install(routes.map(r => ({

                    method: r.method,

                    path: r.path,

                    filters: <Filter<undefined>[]>[...filters, ...r.filters]

                })));

            } else {

                mod.install(routes);

            }

            if (t.app && t.app.notFoundHandler)
                m.app.use(mod.runInContext([t.app.notFoundHandler]));

            if (t.app && t.app.errorHandler)
                m.app.use(mod.runInContextWithError(t.app.errorHandler));

            m.parent.map(p => p.app.use(join('/', m.path), m.app));

        }))
            .map(() => undefined);

    }

}
