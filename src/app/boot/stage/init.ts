import { Dispatcher } from '../../hooks';
import { Stage } from './';
import { App } from '../..';

/**
 * InitStage of Application boot.
 *
 * Invokes the init hooks of all modules.
 */
export class InitStage implements Stage {
    constructor(public hooks: Dispatcher<App>) {}

    name = 'init';

    async execute() {
        return this.hooks.init();
    }
}
