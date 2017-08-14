import * as Bluebird from 'bluebird';
import { Connection } from './Connection';

/**
 * UnsafeStore stores and provides access references in an unsafe way.
 *
 */
export interface UnsafeStore<A> {

    [key: string]: A

}

/**
 * Connections is an unsafe (volatile) store for data connections
 */
export class Connections {

    store: UnsafeStore<Connection> = {};

    add(key: string, conn: Connection): Bluebird<Connections> {

        if (this.store[key] != null)
            return Bluebird.reject(new Error(`A connection already exists named '${key}'!`));

        this.store[key] = conn;

        return Bluebird.resolve(this);

    }

    /**
     * get a pool member.
     */
    get<A>(key: string): Bluebird<A> {

        if (this.store[key])
            return this.store[key].unwrap();

        return Bluebird.reject(new Error(`Connection '${key}', does not exist!`));

    }

}

export const Pool = new Connections();


