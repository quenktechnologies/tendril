import * as session from 'express-session';

import { Future, pure } from '@quenk/noni/lib/control/monad/future';

import { SessionStoreConnection } from './';

/**
 * MemoryConnection provides a SessionStoreConnection wrapper for the
 * express-session#MemoryStore object.
 *
 * Note: This should only be used during development.
 */
export class MemoryConnection implements SessionStoreConnection {

    open() : Future<void> {

      return pure(<void> undefined);

    }

    checkout(): Future<session.Store> {

        console.warn('[MemoryStoreProvider]: Should not be used in production!');
        return pure(<session.Store>new session.MemoryStore());

    }

  close() : Future<void> {

    return pure(<void>undefined);

  }

}
