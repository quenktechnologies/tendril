import * as session from 'express-session';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { SessionStoreConnection } from './';
/**
 * MemoryConnection provides a SessionStoreConnection wrapper for the
 * express-session#MemoryStore object.
 *
 * Note: This should only be used during development.
 */
export declare class MemoryConnection implements SessionStoreConnection {
    open(): Future<void>;
    checkout(): Future<session.Store>;
    close(): Future<void>;
}
