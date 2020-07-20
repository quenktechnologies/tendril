import * as parser from 'cookie-parser';

import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { map } from '@quenk/noni/lib/data/record';

import { ModuleDatas } from '../../module/data';
import { Stage } from './';

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
    enable?: boolean,

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
    secret?: string,

    /**
     * options for the parser.
     */
    options?: parser.CookieParseOptions

}

/**
 * CookieParserStage configures middleware for parsing cookies.
 */
export class CookieParserStage implements Stage {

    constructor(public modules: ModuleDatas) { }

    name = 'cookie-parser';

    execute(): Future<void> {

        let { modules } = this;

        map(modules, m => {

            if (m.template &&
                m.template.app &&
                m.template.app.parsers &&
                m.template.app.parsers.cookie &&
                m.template.app.parsers.cookie.enable) {

                let { cookie } = m.template.app.parsers;

                let secret = cookie.secret ||
                    process.env.COOKIE_SECRET ||
                    process.env.SECRET ||
                    randomSecret;

                if (secret === randomSecret)
                    console.warn(WARN_NO_SECRET);

                m.app.use(parser(secret, cookie.options));

            }

        });

        return pure(<void>undefined);
    }
}

/**
 * @private
 */
export const randomSecret =
    (Math
        .random()
        .toString(36)
        .substring(2, 15)) +
    (Math
        .random()
        .toString(36)
        .substring(2, 15));
