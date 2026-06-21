/**
 * The Per Request Storage module (PRS) provides an API for storing small
 * amounts of data that exist only for the duration of a request.
 *
 * This APIs primary purpose is to provide a way for filters to share data
 * with each other, without modifying the Request object.
 */

/** imports */
import * as path from '@quenk/noni/lib/data/record/path';

import { Value, Object } from '@quenk/noni/lib/data/jsonx';
import { clone } from '@quenk/noni/lib/data/record';
import { Maybe } from '@quenk/noni/lib/data/maybe';

import { Storage } from './';

const mkValues = (prs: PRSStorage): Object =>
    <Object>new Proxy(
        {},
        {
            get: (target, key) =>
                typeof key === 'string'
                    ? prs.exists(key)
                        ? prs.getOrElse(key, <Value>undefined)
                        : undefined
                    : Reflect.get(target, key),
            set: (_, key, value) => {
                if (typeof key === 'string') prs.set(key, <Value>value);
                return true;
            },
            deleteProperty: (_, key) => {
                if (typeof key === 'string') prs.remove(key);
                return true;
            },
            has: (_, key) => typeof key === 'string' && prs.exists(key),
            ownKeys: () => Reflect.ownKeys(prs.getAll()),
            getOwnPropertyDescriptor: (_, key) =>
                typeof key === 'string' && prs.exists(key)
                    ? {
                          value: prs.getOrElse(key, <Value>undefined),
                          enumerable: true,
                          configurable: true,
                          writable: true
                      }
                    : undefined
        }
    );

/**
 * PRSStorage class.
 *
 * This is used behind the scens to provide the prs api.
 */
export class PRSStorage implements Storage {
    public values: Object;

    constructor(public data: Object = {}) {
        this.values = mkValues(this);
    }

    get(key: string): Maybe<Value> {
        return path.get(key, this.data);
    }

    getOrElse(key: string, alt: Value): Value {
        return path.getDefault(key, this.data, alt);
    }

    getAll(): Object {
        return clone(this.data);
    }

    exists(key: string): boolean {
        return path.get(key, this.data).isJust();
    }

    set(key: string, value: Value): PRSStorage {
        this.data = path.set(key, value, this.data);
        return this;
    }

    remove(key: string): PRSStorage {
        let prs = path.flatten(this.data);

        delete prs[key];

        this.data = path.unflatten(prs);

        return this;
    }

    reset(): PRSStorage {
        this.data = {};
        return this;
    }
}
