import * as session from 'express-session';
import { Future } from '@quenk/noni/lib/control/monad/future';
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
    create<O extends object>(expressSession: Function, options?: O): Future<session.Store>;
}
