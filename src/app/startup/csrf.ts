import * as csurf from 'csurf';

import {   merge } from '@quenk/noni/lib/data/record';

import { PRS_VIEW_CONTEXT } from '../api/response';
import { Filter  } from '../api/request';
import { ModuleInfo } from '../module';
import { BaseStartupTask  } from './';
import { RequestContext } from '../api';

export const EVENT_CSRF_TOKEN_FAILURE = 'CSRF_TOKEN_FAILURE';

export const DEFAULT_SEND_COOKIE_NAME = 'xsrf-token';
export const ERROR_TOKEN_INVALID = 'EBADCSRFTOKEN';
export const PRS_CSRF_TOKEN = '$csrf.token';
export const PRS_VIEW_CSRF_TOKEN = `${PRS_VIEW_CONTEXT}.csrf.token`;

const defaultOptions = {
    send_cookie: false,

    send_cookie_name: DEFAULT_SEND_COOKIE_NAME,

    options: {}
};

const readMethods = ['GET', 'HEAD', 'OPTIONS'];

/**
 * CSRFTokenConf can be configured to enabled cross-site request forgery
 * protection.
 */
export interface CSRFTokenConf {
    /**
     * enable if true will enable csrf protection.
     */
    enable?: boolean;

    /**
     * send_cookie if true will send a cookie to the client on each read
     * request containing the value of the current token.
     * Note: This is not the double submit pattern but rather a way for XHR
     * requests to retrieve the token.
     */
    send_cookie?: boolean;

    /**
     * send_cookie_name if set will be used as the name of the cookie used
     * to send the token value.
     *
     * Defaults to DEFAULT_SEND_COOKIE_NAME.
     */
    send_cookie_name?: string;

    /**
     * options passed on to the middleware.
     */
    options?: object;

    /**
     * on hooks.
     */
    on?: {
        /**
         * failure if specified will be invoked whenever a request fails CSRF
         * token validation.
         */
        failure?: Filter
    };
}

/**
 * CSRFTokenStage configures middleware to help protect against CSRF attacks.
 *
 * This requires app.session.enable to be set to true.
 */
export class CSRFTokenStage extends BaseStartupTask {

    name = 'csrf-token';

    async onConfigureModule(mod: ModuleInfo) {
            if (
                mod.conf &&
                mod.conf.app &&
                mod.conf.app.csrf &&
                mod.conf.app.csrf.enable
            ) {
                let conf = merge(defaultOptions, mod.conf.app.csrf);

                mod.express.use(csurf(conf.options));

                if (conf.send_cookie) {
                    mod.express.all('*', (req, res, next) => {
                        if (readMethods.indexOf(req.method) > -1)
                            res.cookie(conf.send_cookie_name, req.csrfToken());

                        next();
                    });
                }

            }

                mod.routing.globalFilters.push(setCSRFToken);
    }
}

// Ensures the csrf token is available via prs and to views.
const setCSRFToken = async (ctx: RequestContext) => {
        let token = ctx.request.toExpress().csrfToken();
        ctx.request.prs.set(PRS_CSRF_TOKEN, token);
         ctx.request.prs.set(PRS_VIEW_CSRF_TOKEN, token);

    }
