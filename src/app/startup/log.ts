import * as express from 'express';
import * as morgan from 'morgan';

import {  merge  } from '@quenk/noni/lib/data/record';

import { ModuleInfo } from '../module';
import { BaseStartupTask } from '.';

/**
 * LogConf can be configured to log each HTTP request as they come in.
 */
export interface LogConf {
    /**
     * enable if true will enable the logging middleware.
     */
    enable?: boolean;

    /**
     * format is a valid format string the morgan middleware can use for logging
     * HTTP requests.
     */
    format?: string;

    /**
     * options that can be additionally passed to the morgan middleware.
     */
    options?: morgan.Options<express.Request, express.Response>;
}

const defaultOptions = {
    format: 'combined'
};

/**
 * LogStage configures the morgan middleware to log incomming requests.
 */
export class LogStage extends BaseStartupTask {

    name = 'log';

    async onConfigureModule(mod: ModuleInfo) {
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
