import * as morgan from 'morgan';

import { merge } from '@quenk/noni/lib/data/record';

import { ModuleInfo } from '../module';
import { BaseStartupTask } from '.';

const defaultOptions = {
    format: 'combined'
};

/**
 * ConfigureRequestLogger configures the request logging middleware for each
 * module enabled.
 *
 *
 * Enabling session support on a parent module will make it available for
 * all the children module as well so no need to repeat.
 */
export class ConfigureRequestLogger extends BaseStartupTask {
    name = 'configure-request-logger';

    async execute(mod: ModuleInfo) {
        if (
            mod.conf &&
            mod.conf.app &&
            mod.conf.app.log &&
            mod.conf.app.log.enable
        ) {
            let conf = merge(defaultOptions, mod.conf.app.log);
            mod.express.use(morgan(conf.format, conf.options));
        }
    }
}
