import { Object, Value } from '@quenk/noni/lib/data/jsonx';
import { Maybe } from '@quenk/noni/lib/data/maybe';

/**
 * Storage API for persisting variable data between handlers.
 */
export interface Storage {
    /**
     * get a value from storage.
     */
    get(key: string): Maybe<Value>;

    /**
     * getOrElse provides a value from storage or the alternative if not
     * found.
     */
    getOrElse(key: string, alt: Value): Value;

    /**
     * getAll returns a copy of all the values in storage.
     */
    getAll(): Object;

    /**
     * set the value of a key in storage.
     */
    set(key: string, value: Value): Storage;

    /**
     * exists tests whether a key exists in storage.
     */
    exists(key: string): boolean;

    /**
     * remove a key from storage.
     */
    remove(key: string): Storage;

    /**
     * reset the storage.
     */
    reset(): Storage;
}
