import * as parser from 'body-parser';

import {  merge } from '@quenk/noni/lib/data/record';

import { ModuleInfo } from '../module';
import { BaseStartupTask  } from './';

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

const defaults = {
    urlencoded: { enable: true }
};

/**
 * BodyParser configures middleware for parsing request bodies into desired
 * values.
 */
export class BodyParser extends BaseStartupTask {

    name = 'parser';

    async onAncestor() {}

    async onModule(mod: ModuleInfo) {
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
