import * as express from 'express';
import * as csurf from 'csurf';

import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { map, merge } from '@quenk/noni/lib/data/record';
import { Type } from '@quenk/noni/lib/data/type';

import { Filter } from '../../api/request';
import { ModuleDatas } from '../../module/data';
import { Stage } from './';

export const DEFAULT_SEND_COOKIE_NAME = 'xsrf-token';
export const ERROR_TOKEN_INVALID = 'EBADCSRFTOKEN';

const defaultOptions = {

    send_cookie: false,

    send_cookie_name: DEFAULT_SEND_COOKIE_NAME,

    options: {}

}

const readMethods = ['GET', 'HEAD', 'OPTIONS'];

/**
 * CSRFTokenConf can be configured to enabled cross-site request forgery 
 * protection.
 */
export interface CSRFTokenConf {

    /**
     * enable if true will enable csrf protection.
     */
    enable?: boolean,

    /**
     * send_cookie if true will send a cookie to the client on each read
     * request containing the value of the current token.
     * Note: This is not the double submit pattern but rather a way for XHR
     * requests to retrieve the token.
     */
    send_cookie?: boolean,

    /**
     * send_cookie_name if set will be used as the name of the cookie used
     * to send the token value.
     *
     * Defaults to DEFAULT_SEND_COOKIE_NAME.
     */
    send_cookie_name?: string,

    /**
     * options passed on to the middleware.
     */
    options?: object,

    /**
     * on hooks.
     */
    on?: {

        /**
         * failure if specified will be invoked whenever a request fails CSRF
         * token validation.
         */
        failure?: Filter<Type>

    }

}

/**
 * CSRFTokenStage configures middleware to help protect against CSRF attacks.
 *
 * This requires app.session.enable to be set to true.
 */
export class CSRFTokenStage implements Stage {

    constructor(public modules: ModuleDatas) { }

    name = 'csrf-token';

    execute(): Future<void> {

        let { modules } = this;

        map(modules, m => {

            if (m.template &&
                m.template.app &&
                m.template.app.csrf &&
                m.template.app.csrf.token &&
                m.template.app.csrf.token.enable) {

                let conf = merge(defaultOptions, m.template.app.csrf.token);

                m.app.use(csurf(conf.options));

                if (conf.send_cookie) {

                    m.app.all('*', (req, res, next) => {

                        if (readMethods.indexOf(req.method) > -1)
                            res.cookie(conf.send_cookie_name, req.csrfToken());

                        next();

                    });

                }

                if (conf.on && conf.on.failure) {

                    let filters = [conf.on.failure];

                  //XXX:The casts to Type are used here because @types/express
                  //has gone wacky. I don't have time for these shenanigans.
                  //See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/40138
                    let handler: Type = (
                        err: Error,
                        req: express.RequestHandler,
                        res: express.Response,
                        next: express.NextFunction) => {

                        if ((<Type>err).code !== ERROR_TOKEN_INVALID)
                            return next();

                        m.module.runInContext(filters)(<Type>req, res, next);

                    };

                    m.app.use(handler);

                }

            }

        });

        return pure(<void>undefined);
    }
}
