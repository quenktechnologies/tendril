import { Future } from '@quenk/noni/lib/control/monad/future';
import { Pool } from '../../connection';
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
export declare class ConnectionsStage implements Stage {
    pool: Pool;
    modules: ModuleDatas;
    hooks: Dispatcher<App>;
    constructor(pool: Pool, modules: ModuleDatas, hooks: Dispatcher<App>);
    name: string;
    execute(): Future<void>;
}
