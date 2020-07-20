import * as parser from 'body-parser';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { ModuleDatas } from '../../module/data';
import { Stage } from './';
/**
 * BodyParserConf can be configured to enabled various request body parsing
 * algorithims.
 */
export interface BodyParserConf {
    /**
     * json configures parsing for json body types.
     */
    json?: {
        /**
         * enable this parser.
         */
        enable?: boolean;
        /**
         * options for the parser.
         */
        options?: parser.OptionsJson;
    };
    /**
     * raw configures parsing of the body into a Buffer.
     */
    raw?: {
        /**
         * enable this parser.
         */
        enable?: boolean;
        /**
         * options for this parser.
         */
        options?: parser.Options;
    };
    /**
     * text configures parsing of the body as text.
     */
    text?: {
        /**
         * enable this parser.
         */
        enable?: boolean;
        /**
         * options for this parser.
         */
        options?: parser.OptionsText;
    };
    /**
     * urlencoded configures parsing the body as url-encoded text.
     */
    urlencoded?: {
        /**
         * enable this parser.
         */
        enable?: boolean;
        /**
         * options for this parser.
         */
        options?: parser.OptionsUrlencoded;
    };
}
/**
 * BodyParserStage configures middleware for parsing request bodies into desired
 * values.
 */
export declare class BodyParserStage implements Stage {
    modules: ModuleDatas;
    constructor(modules: ModuleDatas);
    name: string;
    execute(): Future<void>;
}
