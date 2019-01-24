import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { compose, identity } from '@quenk/noni/lib/data/function';
import { Context } from '../context';
import { Action, ActionM } from './';

/**
 * Await action.
 */
export class Await<A> extends Action<A>{

    constructor(
        public f: () => Future<any>,
        public next: (a: any) => A) { super(next); }

    map<B>(f: (a: A) => B): Await<B> {

        return new Await(this.f, compose(this.next, f));

    }

    exec(_: Context<A>): Future<A> {

        return this.f().map(this.next);

    }

}

/**
 * await a value from an asynchrounous operation before continuing.
 */
export const await = <A>(f: () => Future<A>): ActionM<A> =>
    liftF(new Await(f, identity));
