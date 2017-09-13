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
export class Connections<A> {

    store: UnsafeStore<Connection<A>> = {};

  each(f:(c:Connection<A>)=>Bluebird<void>) : Bluebird<void>{

    return Object.keys(this.store).reduce((p,k)=> p.then(()=>f(this.store[k])), Bluebird.resolve());

  }

    add(key: string, conn: Connection<A>): Bluebird<Connections<A>> {

        if (this.store[key] != null)
            return Bluebird.reject(new Error(`A connection already exists named '${key}'!`));

        this.store[key] = conn;

        return Bluebird.resolve(this);

    }

    /**
     * get a unwraped pool member.
     */
    get(key: string): Bluebird<A> {

        if (this.store[key])
            return this.store[key].unwrap();

        return Bluebird.reject(new Error(`Connection '${key}', does not exist!`));

    }

    flush(): Bluebird<void> {

      return this.each(c=> c.disconnect());

    }

}

export const Pool = new Connections();


