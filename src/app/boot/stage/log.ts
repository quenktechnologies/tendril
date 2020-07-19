import * as express from 'express';
import * as morgan from 'morgan';

import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { merge, map } from '@quenk/noni/lib/data/record';

import { ModuleDatas } from '../../module/data';
import { Stage } from './';

/**
 * LogConf can be configured to log each HTTP request as they come in.
 */
export interface LogConf {

    /**
     * enable if true will enable the logging middleware.
     */
    enable?: boolean,

    /**
     * format is a valid format string the morgan middleware can use for logging
     * HTTP requests.
     */
    format?: string,

    /**
     * options that can be additionally passed to the morgan middleware.
     */
    options?: morgan.Apitions<express.Request, express.Response>

}

const defaultApitions = {

    format: 'combined'

}

/**
 * LogStage configures the morgan middleware to log incomming requests.
 */
export class LogStage implements Stage {

    constructor(public modules: ModuleDatas) { }

    name = 'log';

    execute(): Future<void> {

        let { modules } = this;

        map(modules, m => {

            if (m.template &&
                m.template.app &&
                m.template.app.log &&
                m.template.app.log.enable) {

                let conf = merge(defaultApitions, m.template.app.log);

                m.app.use(morgan(conf.format, conf.options));

            }

        });

        return pure(<void>undefined);

    }
}
