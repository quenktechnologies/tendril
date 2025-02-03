import * as parser from 'cookie-parser';

import { ModuleInfo } from '../module';
import { BaseStartupTask } from '.';

export const WARN_NO_SECRET =
    '[CookieParser]: Warning! No app.parser.cookie.secret configured! \
A random string will be generated and used however this means user sessions\
will not be valid if the application restarts!';

/**
 * CookieSupport configures middleware for parsing cookies.
 */
export class CookieSupport extends BaseStartupTask {
    name = 'cookie-support';

    async execute(mod: ModuleInfo) {
        if (
            mod.conf &&
            mod.conf.app &&
            mod.conf.app.parsers &&
            mod.conf.app.parsers.cookie &&
            mod.conf.app.parsers.cookie.enable
        ) {
            let { cookie } = mod.conf.app.parsers;

            let secret =
                cookie.secret ||
                process.env.COOKIE_SECRET ||
                process.env.SECRET ||
                randomSecret;

            if (secret === randomSecret) console.warn(WARN_NO_SECRET);

            mod.express.use(parser(secret, cookie.options));
        }
    }
}

/**
 * @private
 */
export const randomSecret =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
