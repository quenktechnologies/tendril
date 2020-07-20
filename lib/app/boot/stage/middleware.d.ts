import { Future } from '@quenk/noni/lib/control/monad/future';
import { ModuleDatas } from '../../module/data';
import { App } from '../../';
import { Stage } from './';
/**
 * MiddlewareStage installs the express middleware configured for
 * each module.
 */
export declare class MiddlewareStage implements Stage {
    app: App;
    modules: ModuleDatas;
    constructor(app: App, modules: ModuleDatas);
    name: string;
    execute(): Future<void>;
}
