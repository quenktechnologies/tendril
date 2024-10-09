import {
    Future,
    delay,
    pure,
    raise
} from '@quenk/noni/lib/control/monad/future';
import { Maybe, fromArray } from '@quenk/noni/lib/data/maybe';
import { Object } from '@quenk/noni/lib/data/jsonx';
import { reduce } from '@quenk/noni/lib/data/record';

import { Connection } from '../../lib/app/connection';

export interface Db {
    [key: string]: Object[];
}

export class Memgo implements Connection {
    constructor(public db: Db) {}

    openned: boolean = false;

    open(): Future<void> {
        return delay(() => {
            this.openned = true;
        });
    }

    checkout(): Future<Memgo> {
        return pure(<Memgo>this);
    }

    collection(name: string): Collection {
        if (!this.db[name]) this.db[name] = [];

        return new Collection(this.db[name]);
    }

    close(): Future<void> {
        return delay(() => {
            this.openned = false;
        });
    }
}

export class Collection {
    constructor(public data: Object[]) {}

    insert(o: Object): Future<number> {
        this.data.push(o);
        return pure(this.data.length - 1);
    }

    find(query: Object): Future<Maybe<Object[]>> {
        return pure(
            fromArray(
                this.data.filter(c =>
                    reduce(query, <boolean>false, (pre, curr, key) =>
                        pre ? c[key] === curr : pre
                    )
                )
            )
        );
    }

    findOne(query: Object): Future<Maybe<Object>> {
        return pure(
            fromArray(
                this.data.filter(c =>
                    reduce(query, <boolean>false, (pre, curr, key) =>
                        pre ? c[key] === curr : pre
                    )
                )
            ).map(a => a[0])
        );
    }

    remove(id: number): Future<void> {
        if (this.data[id]) {
            this.data.splice(id, 1);
            return pure((() => {})());
        } else {
            return raise(new Error(`remove: Unknown id "${id}"`));
        }
    }
}

export const memdb = (db: Db) => new Memgo(db);
