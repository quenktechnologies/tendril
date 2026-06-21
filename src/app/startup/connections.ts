import { ModuleInfo } from '../module';
import { BaseStartupTask } from './';

/**
 * PoolConnectionsTask handles the pooling of connections for each module.
 *
 * Connections are opened sequentially for each module.
 */
export class PoolConnectionsTask extends BaseStartupTask {
    name = 'pool-connections';

    async execute(mod: ModuleInfo) {
        let { pool } = this.app;
        for (let [name, conn] of Object.entries(
            mod.conf.app?.connections || {}
        )) {
            pool.add(name, conn.provider(conn.options));
        }
    }
}
