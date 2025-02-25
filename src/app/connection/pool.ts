import { Record, mapTo } from '@quenk/noni/lib/data/record';
import { Type } from '@quenk/noni/lib/data/type';

/**
 * Provider is the type of function used to create Connection instances.
 */
export type Provider = (options?: object) => Connection;

/**
 * Connection abstracts long lived connections to external services.
 *
 * It provides a common interface by which a tendril app can manage the
 * state of connected services (usually a DB) during the app's lifecycle.
 */
export interface Connection {
    /**
     * open the connection.
     *
     * When called this method should create and initialize its internal
     * connection to an external service.
     */
    open(): Promise<void>;

    /**
     * get the actual underlying connection's implementation.
     *
     * The result of this method is what is actually used for the app's logic.
     * For databases, this is the db object as an example.
     */
    get(): Promise<Type>;

    /**
     * close the connection.
     */
    close(): Promise<void>;
}

// store connections in one place.
let conns: Record<Connection> = {};

/**
 * Pool is a singleton providing access to all the connections configured for
 * a tendril app.
 */
export class Pool {
    /**
     * add a new Connection to the pool.
     */
    static add(key: string, conn: Connection) {
        conns[key] = conn;
    }

    /**
     * has returns true if a connection exists (but not necessarily open).
     */
    static has(key: string): boolean {
        return !!conns[key];
    }

    /**
     * open all the connections in the pool.
     */
    static async open() {
        await Promise.allSettled(mapTo(conns, c => c.open()));
    }

    /**
     * checkout an underlying connection from the pool.
     *
     * Note that this provides the implementation of the connection, not the
     * Connection object itself.
     *
     * TODO: open() on lazy connections.
     */
    static async checkout<T>(key: string): Promise<T> {
        if (!conns[key]) throw new Error(`Connection "${key}" not found!`);
        return conns[key].get();
    }

    /**
     * close all the connections in the pool.
     */
    static async close() {
        await Promise.allSettled(mapTo(conns, c => c.close()));
        conns = {};
    }
}
