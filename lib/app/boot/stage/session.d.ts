import * as session from 'express-session';
import * as express from 'express';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { SessionStoreProvider } from '../../middleware/session/store/provider';
import { ModuleDatas } from '../../module/data';
import { Stage } from './';
export declare const SESSION_COOKIE_NAME = "tendril.session.id";
export declare const WARN_NO_SECRET = "[SessionStage]: Warning! No app.session.options.secret configured! A random string will be generated and used however this means user sessionswill not be valid if the application restarts!";
/**
 * SessionConf contains settings for configuring session usage.
 */
export interface SessionConf {
    /**
     * enable if true, will turn on session support.
     *
     * Defaults to true.
     */
    enable?: boolean;
    /**
     * options configurable for the session module.
     */
    options?: session.SessionOptions;
    /**
     * store configuration for the session.
     */
    store?: {
        /**
         * provider used to create the underlying Store object.
         *
         * If unspecified, the inefficient memory store will be used.
         */
        provider?: SessionStoreProvider;
        /**
         * options passed to the SessionStoreProvider
         */
        options?: object;
    };
}
/**
 * SessionStage configures session middleware automtically if enabled.
 *
 * This will configure session support for EACH module that declares
 * "app.session.enable = true". A app.session.options.secret SHOULD be provided
 * for sigining cookies (to detect tampering). If it is not supplied the
 * following takes place:
 *
 * 1. The value is read from process.env.SESSION_SECRET or
 * 2. the value is read from process.env.COOKIE_SECRET or
 * 3. the value is read from process.env.SECRET otherwise
 * 4. a random string is generated (sessions will not survive app restarts).
 */
export declare class SessionStage implements Stage {
    modules: ModuleDatas;
    constructor(modules: ModuleDatas);
    name: string;
    execute(): Future<void>;
}
/**
 * handleSessionTTL is responsible for:
 * 1. Removing session values that have reached TTL 0.
 * 2. Decrementing session values that have their TTL set.
 * @private
 */
export declare const handleSessionTTL: (req: express.Request, _: express.Response, next: express.NextFunction) => void;
