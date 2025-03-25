import { ModuleInfo } from '../module';
import { App } from '../';

export type StartupTaskName = string;

/**
 * StartupTask is a contained stage in the boot up of a tendril application.
 *
 * These are used ton configure internals such as middleware, logging, routing,
 * database connections etc.
 */
export interface StartupTask {
    /**
     * name of the StartupTask.
     *
     * This will be displayed in the terminal.
     */
    name: StartupTaskName;

    /**
     * execute the task.
     */
    execute(module: ModuleInfo): Promise<void>;
}

/**
 * BaseStartupTask providing boilerplate for implementors.
 */
export abstract class BaseStartupTask implements StartupTask {
    abstract name: StartupTaskName;

    constructor(public app: App) {}

    abstract execute(m: ModuleInfo): Promise<void>;
}

/**
 * StartupManager combines the execution of all the tasks into a single
 * location.
 */
export class StartupManager {
    constructor(public tasks: (app: App) => StartupTask[]) {}

    name = 'startup-manager';

    async run(app: App) {
        for (let task of this.tasks(app)) {
            for (let mod of Object.values(app.modules)) {
              app.log.debug(`[${task.name}]: Execution started for module "${mod.address}"`);
                await task.execute(mod);
                app.log.debug(`[${task.name}]: Execution complete for module "${mod.address}"`);
            }
        }
    }
}
