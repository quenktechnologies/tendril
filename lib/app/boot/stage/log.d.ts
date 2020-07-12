import * as express from 'express';
import * as morgan from 'morgan';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { ModuleDatas } from '../../module/data';
import { Stage } from './';
/**
 * LogConf can be configured to log each HTTP request as they come in.
 */
export interface LogConf {
    /**
     * enabled if true will enable the logging middleware.
     */
    enabled?: boolean;
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
/**
 * LogStage configures the morgan middleware to log incomming requests.
 */
export declare class LogStage implements Stage {
    modules: ModuleDatas;
    constructor(modules: ModuleDatas);
    name: string;
    execute(): Future<void>;
}
