import * as express from 'express';
import * as morgan from 'morgan';

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

