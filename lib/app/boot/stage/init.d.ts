import { Future } from '@quenk/noni/lib/control/monad/future';
import { Dispatcher } from '../../hooks';
import { Stage } from './';
import { App } from '../..';
/**
 * InitStage of Application boot.
 *
 * Invokes the init hooks of all modules.
 */
export declare class InitStage implements Stage {
    hooks: Dispatcher<App>;
    constructor(hooks: Dispatcher<App>);
    name: string;
    execute(): Future<void>;
}
