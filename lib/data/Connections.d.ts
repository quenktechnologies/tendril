import * as Bluebird from 'bluebird';
import { Connection } from './Connection';
/**
 * UnsafeStore stores and provides access references in an unsafe way.
 *
 */
export interface UnsafeStore<A> {
    [key: string]: A;
}
/**
 * Connections is an unsafe (volatile) store for data connections
 */
export declare class Connections {
    store: UnsafeStore<Connection>;
    add(key: string, conn: Connection): Bluebird<Connections>;
    /**
     * get a pool member.
     */
    get<A>(key: string): Bluebird<A>;
}
export declare const Pool: Connections;
