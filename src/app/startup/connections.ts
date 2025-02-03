import { ModuleInfo } from '../module';
import { BaseStartupTask } from './';

/**
 * PoolConnections handles the pooling of connections for each module.
 *
 * Connections are opened sequentially for each module.
 */
export class PoolConnections extends BaseStartupTask {

    name = 'pool-connections';

    async execute(mod: ModuleInfo) {
        let { pool } = this.app;

        //TODO: Refactor with pool changes.
        for (let [name, conn] of Object.entries(mod.connections)) {
            await pool.add(name, conn);
        }
    }
}
