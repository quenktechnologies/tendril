import * as session from 'express-session';
import { SessionStoreProvider } from '../../middleware/session/store/provider';
/**
 * SessionConf contains settings for configuring session usage.
 */
export interface SessionConf {
    /**
     * enabled if true, will turn on session support.
     *
     * Defaults to true.
     */
    enabled?: boolean;
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
