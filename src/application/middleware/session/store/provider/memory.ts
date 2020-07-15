import * as session from 'express-session';

import { Future, pure } from '@quenk/noni/lib/control/monad/future';

import { SessionStoreProvider } from './';

/**
 * MemoryStoreProvider provides the express-session#MemoryStore Store.
 *
 * Note: This should only be used during development.
 */
export class MemoryStoreProvider implements SessionStoreProvider {

    create(): Future<session.Store> {

        console.warn('[MemoryStoreProvider]: Should not be used in production!');
        return pure(<session.Store>new session.MemoryStore());

    }

}
