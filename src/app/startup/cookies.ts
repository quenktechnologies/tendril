import * as parser from 'cookie-parser';

import { ModuleInfo } from '../module';
import { BaseStartupTask  } from '.';

export const WARN_NO_SECRET =
    '[CookieParser]: Warning! No app.parser.cookie.secret configured! \
A random string will be generated and used however this means user sessions\
will not be valid if the application restarts!';

/**
 * CookieParserConf can be configured to enabled parsing of the Cookie header.
 */
export interface CookieParserConf {
    /**
     * enable this parser.
     */
    enable?: boolean;

    /**
     * secret used to sign cookies.
     *
     * If not specified is read from the following:
     * 1) process.env.COOKIE_SECRET
     * 2) process.env.SECRET
     * 3) a random generated string.
     *
     * If the 3rd option is used, cookies will not be valid after the
     * application restarts!
     */
    secret?: string;

    /**
     * options for the parser.
     */
    options?: parser.CookieParseOptions;
}

/**
 * CookieStage configures middleware for parsing cookies.
 */
export class CookiesStage extends BaseStartupTask {
    name = 'cookies';

    async onConfigureModule(mod: ModuleInfo) {
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
