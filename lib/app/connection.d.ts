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
 * Connection interface.
 *
 * This interface is used to abstract various data stores and
 * third party services the app may maintain persistenta open connections
 * to.
 */
export interface Connection {
    /**
     * open the connection.
     *
     * When called this method can initialize a new connection/pool or
     * simply lie for connections that are not meant to be kept open.
     */
    open(): Future<Connection>;
    /**
     * checkout the actual underlying implementation.
     *
     * This method provides the interface (in an unsafe manner)
     * to the library that is used to actually interface with the
     * remote service.
     *
     * NOTE: We use <any> here to avoid carrying the type
     * all the way to the App class.
     *
     * This was done to ease the burden of using this API.
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
