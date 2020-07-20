import { Future } from '@quenk/noni/lib/control/monad/future';
import { Type } from '@quenk/noni/lib/data/type';
import { Filter } from '../../api/request';
import { ModuleDatas } from '../../module/data';
import { Stage } from './';
export declare const DEFAULT_SEND_COOKIE_NAME = "xsrf-token";
export declare const ERROR_TOKEN_INVALID = "EBADCSRFTOKEN";
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
        failure?: Filter<Type>;
    };
}
/**
 * CSRFTokenStage configures middleware to help protect against CSRF attacks.
 *
 * This requires app.session.enable to be set to true.
 */
export declare class CSRFTokenStage implements Stage {
    modules: ModuleDatas;
    constructor(modules: ModuleDatas);
    name: string;
    execute(): Future<void>;
}
