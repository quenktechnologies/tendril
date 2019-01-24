import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Future, pure, attempt } from '@quenk/noni/lib/control/monad/future';
import {Action, ActionM} from '../';
import {Context} from '../../context';

/**
 * Redirect action.
 */
export class Redirect<A> extends Action<A> {

    constructor(
        public url: string,
        public code: number,
        public next: A) { super(next); }

    map<B>(f: (a: A) => B): Redirect<B> {

        return new Redirect(this.url, this.code, f(this.next));

    }

  exec({ response }: Context<A>): Future<A> {

        return attempt(() => response.redirect(this.url, this.code))
            .chain(() => pure(this.next));

    }

}

/**
 * redirect the client to a new resource.
 */
export const redirect = (url: string, code: number): ActionM<undefined> =>
    liftF(new Redirect(url, code, undefined));
