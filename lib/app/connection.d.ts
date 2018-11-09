import { Future } from '@quenk/noni/lib/control/monad/future';
import { Maybe } from '@quenk/noni/lib/data/maybe';
/**
 * Connections map.
 */
export interface Connections {
    [key: string]: Connection;
}
/**
 * Store of connections.
 */
export interface Store {
    [key: string]: Connection;
}
/**
 * Connection
 */
export interface Connection {
    /**
     * open the connection.
     */
    open(): Future<Connection>;
    /**
     * checkout the actual connection implementation.
     *
     * This is the value will be used by applications
     * to run queries, send data etc.
     *
     * NOTE: We use any here to avoid carrying the type
     * all the way to the application. That may be the safer
     * thing to do but is a pain manage.
     * It looks like with strict:true, typescript won't allow
     * implementors to override a method type parameter here
     * that is determined by return value only.
     */
    checkout(): Future<any>;
    /**
     * close the connection.
     */
    close(): Future<void>;
}
/**
 * Pool provides a simple storage medium for persistent
 * remote resources used in an application.
 *
 * These resources may be databases, other http servers or
 * some low level resource the application uses.
 *
 * The Pool class itself does not actually implement connection
 * pooling, instead the implementation of such is left up to
 * the implementors of the Connection interface.
 *
 * What this class really provides is a way to open and close
 * a group of connections at once, as well as retrieve
 * indivdiual ones when needed.
 *
 * TODO: In the future we may add a way for connections to be re-established,
 * lazily started and more. This would be subject to whether we decide to make
 * connections actors or not.
 */
export declare class Pool {
    store: Store;
    constructor(store: Store);
    /**
     * add a new Conneciton to the pool.
     */
    add(key: string, conn: Connection): Pool;
    /**
     * get a Connection from the pool.
     **/
    get(key: string): Maybe<Connection>;
    /**
     * open all the connections in the pool.
     */
    open(): Future<void>;
    /**
     * close all the connections in the pool.
     */
    close(): Future<void>;
}
