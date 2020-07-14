import * as parser from 'cookie-parser';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { ModuleDatas } from '../../module/data';
import { Stage } from './';
export declare const WARN_NO_SECRET = "[CookieParser]: Warning! No app.parser.cookie.secret configured! A random string will be generated and used however this means user sessionswill not be valid if the application restarts!";
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
 * CookieParserStage configures middleware for parsing cookies.
 */
export declare class CookieParserStage implements Stage {
    modules: ModuleDatas;
    constructor(modules: ModuleDatas);
    name: string;
    execute(): Future<void>;
}
/**
 * @private
 */
export declare const randomSecret: string;
