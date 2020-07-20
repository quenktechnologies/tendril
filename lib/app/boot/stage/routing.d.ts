import { Future } from '@quenk/noni/lib/control/monad/future';
import { ModuleDatas } from '../../module/data';
import { Stage } from './';
/**
 * RoutingStage sets up all the Application routing in one go.
 */
export declare class RoutingStage implements Stage {
    modules: ModuleDatas;
    constructor(modules: ModuleDatas);
    name: string;
    execute(): Future<void>;
}
