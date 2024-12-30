import {InitEvent} from '../events';
import { App } from '../';
import { BaseStartupTask } from './';

/**
 * InitStage of Application boot.
 *
 * Invokes the init hooks of all modules.
 */
export class InitStage extends BaseStartupTask {
    constructor(public app: App) { super(); }

    name = 'init';

    async onModulesReady() {
        await this.app.events.dispatch(new InitEvent());
    }
}
