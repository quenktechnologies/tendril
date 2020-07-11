import {
    Future,
    raise,
    pure,
    parallel
} from '@quenk/noni/lib/control/monad/future';
import { DoFn, doN } from '@quenk/noni/lib/control/monad';
import { Maybe } from '@quenk/noni/lib/data/maybe';

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
        public moduleProvider: () => Maybe<ModuleData>,
        public hooks: Dispatcher<App>) { }

    name = 'listen';

    execute(): Future<void> {

        let { moduleProvider, server, hooks } = this;

        return doN(<DoFn<void, Future<void>>>function*() {

            let mmodule = moduleProvider();

            if (mmodule.isJust())
                yield parallel([
                    server.listen(mmodule.get().app).map(() => { }),
                    hooks.started()
                ]);
            else
                yield raise(new Error('Server not initialized!'));

            return pure(undefined);

        });

    }

}
