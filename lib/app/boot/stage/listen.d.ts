import { Future } from '@quenk/noni/lib/control/monad/future';
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
export declare class ListenStage implements Stage {
    server: Server;
    hooks: Dispatcher<App>;
    mainProvider: () => Maybe<ModuleData>;
    constructor(server: Server, hooks: Dispatcher<App>, mainProvider: () => Maybe<ModuleData>);
    name: string;
    execute(): Future<void>;
}
