import { Record } from '@quenk/noni/lib/data/record';

import { ModuleInfo } from '../module';

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
     * onScanAncestors is called with a target module and all its ancestors.
     * 
     * Use to collect inheirted configuration data.
     */
    onScanAncestors(target:ModuleInfo, ancestors: ModuleInfo[]): void;

    /**
     * onConfigureModule is called to configure a single module.
     */
    onConfigureModule(module: ModuleInfo): Promise<void>;

    /**
     * onModulesReady is called at the end of the startup lifecycle.
     */
    onModulesReady(): Promise<void>;
}

export abstract class BaseStartupTask implements StartupTask {
    abstract name: StartupTaskName;

    async onScanAncestors(_target:ModuleInfo, _ancestors: ModuleInfo[]) {}

    async onConfigureModule(_: ModuleInfo): Promise<void> {}

    async onModulesReady(): Promise<void> {}
}

export class StartupTaskManager {
    constructor(
        public tasks: StartupTask[] = [],
        public modules: Record<ModuleInfo>
    ) {}

    async dispatchAncestorScan() {
        for (let mod of Object.values(this.modules)) {
            let parents = [];
            let target = mod;
            while ((target = <ModuleInfo>mod.parent)) parents.push(target);

            for (let task of this.tasks) {
                task.onScanAncestors(mod, parents);
            }
        }
    }

    async dispatchConfigureModules() {
        for (let mod of Object.values(this.modules)) {
            for (let task of this.tasks) {
                await task.onConfigureModule(mod);
            }
        }
    }

    async dispatchStartupFinished() {
        for (let task of this.tasks) task.onModulesReady();
    }

    async run() {
        await this.dispatchAncestorScan();
        await this.dispatchConfigureModules();
        await this.dispatchStartupFinished();
    }
}
