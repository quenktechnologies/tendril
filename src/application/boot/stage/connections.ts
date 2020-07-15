import { Future } from '@quenk/noni/lib/control/monad/future';
import { reduce, map } from '@quenk/noni/lib/data/record';

import { Pool, Connection } from '../../connection';
import { ModuleDatas } from '../../module/data';
import { Dispatcher } from '../../hooks';
import { App } from '../../';
import { Stage } from './';

/**
 * ConnectionsStage opens all the connections configured for all the modules of 
 * the Application.
 *
 * Connections are opened sequentially at the Application level but in parallel
 * at the module level. Currently if any fail, the whole boot process fails.
 * Issue #28 is tracking this.
 */
export class ConnectionsStage implements Stage {

    constructor(
        public pool: Pool,
        public modules: ModuleDatas,
        public hooks: Dispatcher<App>) { }

    name = 'connections';

    execute(): Future<void> {

        let { modules, pool, hooks } = this;

        return reduce(modules, pool, (p, m) => {

            map(m.connections, (c: Connection, k) => p.add(k, c));
            return p;

        })
            .open()
            .chain(() => hooks.connected());

    }

}
