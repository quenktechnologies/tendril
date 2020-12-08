/**
 * Here you will find api functions for interacting with the application's
 * connection pool.
 */

/** imports */
import { Future, raise } from '@quenk/noni/lib/control/monad/future';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { compose, identity } from '@quenk/noni/lib/data/function';

import { Api, Action,Context  } from './';

/**
 * Checkout action.
 */
export class Checkout<A> extends Api<A> {

    constructor(public name: string, public next: (x: any) => A) { super(next); }

    map<B>(f: (n: A) => B): Checkout<B> {

        return new Checkout(this.name, compose(this.next, f));

    }

    exec({ module }: Context<A>): Future<A> {

        return <Future<A>>module.app.pool
            .get(this.name)
            .map(c => c.checkout().map(this.next))
            .orJust(() => raise(new Error(`Unknown connection:"${this.name}"!`)))
            .get();

    }

}

/**
 * checkout a Connection from the application's pool.
 */
export const checkout = <A>(name: string): Action<A> =>
    liftF(new Checkout<A>(name, identity));
