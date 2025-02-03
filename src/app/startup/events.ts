import { ModuleInfo } from '../module';
import { EventListener } from '../events';
import { BaseStartupTask } from './';

/**
 * ConfigureEventListeners installs each module's lifecycle event listener(s)
 * on the app.
 *
 * This task is also responsible for dispatching the "init" event.
 */
export class ConfigureEventListeners extends BaseStartupTask {
    name = 'configure-event-handlers';

    async execute(mod: ModuleInfo) {
        for (let handler of normalizeHandler(mod.conf?.app?.on?.init))
            this.app.events.addListener('init', handler);

        for (let handler of normalizeHandler(mod.conf?.app?.on?.connected))
            this.app.events.addListener('connected', handler);

        for (let handler of normalizeHandler(mod.conf?.app?.on?.started))
            this.app.events.addListener('started', handler);
    }
}

const normalizeHandler = (handler?: EventListener | EventListener[]) =>
    handler ? (Array.isArray(handler) ? handler : [handler]) : [];
