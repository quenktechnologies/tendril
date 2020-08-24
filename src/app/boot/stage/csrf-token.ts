import * as express from 'express';
import * as csurf from 'csurf';
import * as prs from '../../api/storage/prs';

import { Future, fromCallback } from '@quenk/noni/lib/control/monad/future';
import { map, merge } from '@quenk/noni/lib/data/record';
import { Type } from '@quenk/noni/lib/data/type';

import { ModuleDatas } from '../../module/data';
import { PRS_VIEW_CONTEXT } from '../../api/response';
import { Filter, Request } from '../../api/request';
import { next } from '../../api/control';
import { getToken } from '../../api/csrf';
import { Action, doAction } from '../../api';
import { Stage } from './';

export const DEFAULT_SEND_COOKIE_NAME = 'xsrf-token';
export const ERROR_TOKEN_INVALID = 'EBADCSRFTOKEN';
export const PRS_CSRF_TOKEN = '$csrf.token';
export const PRS_VIEW_CSRF_TOKEN = `${PRS_VIEW_CONTEXT}.csrf.token`;

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

        return fromCallback(cb => {

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
                                res.cookie(conf.send_cookie_name,
                                    req.csrfToken());

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

                m.module.addBefore(setCSRFToken);

            });

            return cb(null);

        });

    }
}

// Ensures the csrf token is available via prs and to views.
const setCSRFToken = (r: Request): Action<undefined> =>
    doAction<undefined>(function*() {

        let token = yield getToken();

        yield prs.set(PRS_CSRF_TOKEN, token);
        yield prs.set(PRS_VIEW_CSRF_TOKEN, token);

        return next(r);

    });
