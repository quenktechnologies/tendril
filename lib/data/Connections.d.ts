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
export declare class Connections<A> {
    store: UnsafeStore<Connection<A>>;
    each(f: (c: Connection<A>) => Bluebird<void>): Bluebird<void>;
    add(key: string, conn: Connection<A>): Bluebird<Connections<A>>;
    /**
     * get a unwraped pool member.
     */
    get(key: string): Bluebird<A>;
    flush(): Bluebird<void>;
}
export declare const Pool: Connections<{}>;
