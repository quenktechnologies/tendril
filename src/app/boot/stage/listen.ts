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
        public mainProvider: () => ModuleData,
        public app: any
    ) {}

    name = 'listen';

    async execute() {
        let { mainProvider, server, hooks } = this;

        let module = mainProvider();

        await Promise.allSettled([
            server.listen(module.app).map(() => {}),
            hooks.started()
        ]);
    }
}
