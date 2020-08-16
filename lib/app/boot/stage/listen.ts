import {
    Future,
    pure,
    parallel
} from '@quenk/noni/lib/control/monad/future';
import { DoFn, doN } from '@quenk/noni/lib/control/monad';

import { Server } from '../../../net/http/server';
import { ModuleData } from '../../module/data';
import { Dispatcher } from '../../hooks';
import { App } from '../..';
import { Stage } from './';

/**
 * ListenStage starts the HTTP server to accept remote connections.
 *
 * This will also dispatch the "started" event.
 */
export class ListenStage implements Stage {

    constructor(
        public server: Server,
        public hooks: Dispatcher<App>,
        public mainProvider: () => ModuleData) { }

    name = 'listen';

    execute(): Future<void> {

        let { mainProvider, server, hooks } = this;

        return doN(<DoFn<void, Future<void>>>function*() {

            let module = mainProvider();

                yield parallel([
                    server.listen(module.app).map(() => { }),
                    hooks.started()
                ]);

            return pure(undefined);

        });

    }

}
