import * as parser from 'body-parser';

import { merge } from '@quenk/noni/lib/data/record';

import { ModuleInfo } from '../module';
import { BaseStartupTask } from './';

const defaults = {
    urlencoded: { enable: true }
};

/**
 * ConfigureBodyParser configures middleware for parsing request bodies into
 * desired values.
 */
export class ConfigureBodyParser extends BaseStartupTask {
    name = 'configure-body-parser';

    async execute(mod: ModuleInfo) {
        if (
            mod.conf &&
            mod.conf.app &&
            mod.conf.app.parsers &&
            mod.conf.app.parsers.body
        ) {
            let body = merge(defaults, mod.conf.app.parsers.body);

            if (body.json && body.json.enable)
                mod.express.use(parser.json(body.json.options));

            if (body.raw && body.raw.enable)
                mod.express.use(parser.raw(body.raw.options));

            if (body.text && body.text.enable)
                mod.express.use(parser.text(body.text.options));

            if (body.urlencoded && body.urlencoded.enable)
                mod.express.use(parser.urlencoded(body.urlencoded.options));
        }
    }
}
