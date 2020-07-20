import * as session from 'express-session';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { SessionStoreProvider } from './';
/**
 * MemoryStoreProvider provides the express-session#MemoryStore Store.
 *
 * Note: This should only be used during development.
 */
export declare class MemoryStoreProvider implements SessionStoreProvider {
    create(): Future<session.Store>;
}
