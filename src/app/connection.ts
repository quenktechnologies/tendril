import { mapTo } from '@quenk/noni/lib/data/record';
import {
    Future,
    parallel,
    doFuture,
    pure
} from '@quenk/noni/lib/control/monad/future';
import { Maybe, fromNullable, just } from '@quenk/noni/lib/data/maybe';
import { noop } from '@quenk/noni/lib/data/function';

/**
 * Connections map.
 */
export interface Connections {

    [key: string]: Connection

}

/**
 * ConnectionStore
 */
export interface ConnectionStore {

    [key: string]: Connection

}

/**
 * Connection interface.
 *
 * This interface is used to abstract various data stores and
 * third party services the app may maintain persistent open connections
 * to.
 */
export interface Connection {

    /**
     * open the connection.
     *
     * When called this method can initialize a new connection/pool or 
     * simply lie for connections that are not meant to be kept open.
     */
    open(): Future<void>;

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
 * pooling, instead implementation is left up to the Connections.
 *
 * What this class really provides is a way to open and close
 * a group of connections at once, as well as retrieve
 * individual ones when needed. Tendril relies on this to cleanly shutdown.
 */
export class Pool {

    constructor(public conns: ConnectionStore) { }

  /**
   * getInstance provides the singleton instance of the connection pool.
   */
    static getInstance() {

        return pool;

    }

    /**
     * add a new Connection to the pool.
     */
    add(key: string, conn: Connection): Pool {

        this.conns[key] = conn;
        return this;

    }

    /**
     * get a Connection from the pool.           
     **/
    get(key: string): Maybe<Connection> {

        return fromNullable(this.conns[key]);

    }

    /**
     * open all the connections in the pool.
     */
    open(): Future<void> {

        return parallel(mapTo(this.conns, c => c.open())).map(noop);

    }

    /**
     * close all the connections in the pool.
     */
    close(): Future<void> {

        return parallel(mapTo(this.conns, c => c.close())).map(() => {
            this.conns = {};
        });

    }

}

// store connections in one place.
const pool = new Pool({});

/**
 * getInstance provides the singleton instance of the connection pool.
 */
export const getInstance = (): Pool => pool;

/**
 * getUserConnection provides the underlying user connection by name if found.
 */
export const getUserConnection = <T>(name: string): Future<Maybe<T>> =>
    doFuture(function*() {

        let mConn = pool.get(name);

        if (mConn.isNothing())
            return pure(mConn);

        let conn = yield mConn.get().checkout();

        return pure(just(conn));

    });

/**
 * unsafeGetUserConnection is like getUserConnection but assumes the connection
 * exists. 
 *
 * If the the connection does not exist, the Future will raise an exception.
 */
export const unsafeGetUserConnection = <T>(name: string): Future<T> =>
    getUserConnection(name).map(m => <T>m.get());
