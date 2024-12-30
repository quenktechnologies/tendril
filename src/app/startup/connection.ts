import { Pool  } from '../connection';
import { ModuleInfo } from '../module';
import { ConnectedEvent } from '../events';
import { App } from '../';
import { BaseStartupTask } from './';

/**
 * ConnectionStage opens all the connections configured for all the modules of
 * the Application.
 *
 * Connections are opened sequentially at the Application level but in parallel
 * at the module level. Currently if any fail, the whole boot process fails.
 * Issue #28 is tracking this.
 */
export class ConnectionStage extends BaseStartupTask {
    constructor(
      public app: App,
        public pool: Pool,
    ) { super(); }

    name = 'connections';

    async onConfigureModule(mod: ModuleInfo) {
        let { pool } = this;

        //TODO: Catch error and return in report.
        for (let [name, conn] of Object.entries(mod.connections)) {
            await pool.add(name, conn);
        }
    }

    async onModulesReady() {
        
        //TODO: Catch error and return in report.
        await this.pool.open();

        await this.app.events.dispatch(new ConnectedEvent());
    }
}
