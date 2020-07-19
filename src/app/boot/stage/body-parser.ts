import * as parser from 'body-parser';

import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { map } from '@quenk/noni/lib/data/record';

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
        enable?: boolean,

        /**
         * options for the parser.
         */
        options?: parser.OptionsJson

    },

    /**
     * raw configures parsing of the body into a Buffer.
     */
    raw?: {

        /**
         * enable this parser.
         */
        enable?: boolean,

        /**
         * options for this parser.
         */
        options?: parser.Options

    },

    /**
     * text configures parsing of the body as text.
     */
    text?: {

        /**
         * enable this parser.
         */
        enable?: boolean,

        /**
         * options for this parser.
         */
        options?: parser.OptionsText

    },

    /**
     * urlencoded configures parsing the body as url-encoded text.
     */
    urlencoded?: {

        /**
         * enable this parser.
         */
        enable?: boolean,

        /**
         * options for this parser.
         */
        options?: parser.OptionsUrlencoded

    }

}

/**
 * BodyParserStage configures middleware for parsing request bodies into desired
 * values.
 */
export class BodyParserStage implements Stage {

    constructor(public modules: ModuleDatas) { }

    name = 'body-parser';

    execute(): Future<void> {

        let { modules } = this;

        map(modules, m => {

            let { app } = m;

            if (m.template &&
                m.template.app &&
                m.template.app.parser &&
                m.template.app.parser.body) {

                let { body } = m.template.app.parser;

                if (body.json && body.json.enable)
                    app.use(parser.json(body.json.options));

                if (body.raw && body.raw.enable)
                    app.use(parser.raw(body.raw.options));

                if (body.text && body.text.enable)
                    app.use(parser.text(body.text.options));

                if (body.urlencoded && body.urlencoded.enable)
                    app.use(parser.urlencoded(body.urlencoded.options));

            }

        });

        return pure(<void>undefined);
    }
}
