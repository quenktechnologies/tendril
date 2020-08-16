import * as express from 'express';
import * as session from 'express-session';
import { Future } from '@quenk/noni/lib/control/monad/future';
/**
 * SessionFunc is used by some session middleware so that the underlying
 * library uses the same bindings as the app.
 */
export declare type SessionFunc = (options?: session.SessionOptions) => express.RequestHandler;
/**
 * SessionStoreProvider is responsible for providing the
 * express-session#Store instance.
 */
export interface SessionStoreProvider {
    /**
     * create the session Store.
     *
     * Any remote connections the Store needs to make should happen
     * before providing the instance. This allows any failures to be
     * reflected in the app boot up.
     *
     * @param expressSession - This is the express-session default export.
     * @param options        - Options provided for the store (if any).
     */
    create<O extends object>(expressSession: SessionFunc, options?: O): Future<session.Store>;
}
