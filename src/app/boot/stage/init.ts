import { Future } from '@quenk/noni/lib/control/monad/future';

import { Dispatcher } from '../../hooks';
import { Stage } from './';
import { App } from '../..';

/**
 * InitStage of Application boot.
 *
 * Invokes the init hooks of all modules.
 */
export class InitStage implements Stage {

    constructor(public hooks: Dispatcher<App>) { }

    name = 'init';

    execute(): Future<void> {

        return this.hooks.init();

    }

}
