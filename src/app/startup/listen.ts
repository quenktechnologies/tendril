import { Server } from '../../net/http/server';
import { App } from '../';
import { BaseStartupTask } from '.';
import { ModuleInfo } from '../module';
import { StartedEvent } from '../events';

/**
 * ListenStage starts the HTTP server to accept remote connections.
 *
 * This will also dispatch the "started" event.
 */
export class ListenStage extends BaseStartupTask {
    constructor(
        public server: Server,
        public mainProvider: () => ModuleInfo,
        public app: App
    ) { super(); }

    name = 'listen';

    async onModulesReady() {
        let { mainProvider, server, app } = this;

        let module = mainProvider();

        await Promise.allSettled([
            server.listen(module.express).map(() => {}),
            app.events.dispatch(new StartedEvent())
        ]);
    }
}
