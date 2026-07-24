import { Record } from '@quenk/noni/lib/data/record';

import {
    SharedCreateTemplate,
    Template
} from '@quenk/potoo/lib/actor/template';

import { AppConf } from '../conf';

export { getModuleConfFromMetadata as fromMetadata } from '../api/module';

/**
 * ModuleConf is the source configuration data used for creating Module
 * instances and related resources.
 *
 * A ModuleConf is also a potoo Template and is used to spawn the Module
 * as an actor.
 */
export interface ModuleConf extends Omit<SharedCreateTemplate, 'create'> {
    /**
     * disabled indicates whether the module should be disabled or not.
     */
    disabled?: boolean;

    /**
     * app configuration settings.
     */
    app?: AppConf;

    /**
     * modules to spawn after this one has been initialized.
     *
     * This directive is what allows for nested routes and submodules
     * within an app.
     */
    modules?: Record<ModuleConf>;

    /**
     * children templates to spawn after the module has been initialized.
     */
    children?: Template[];
}
