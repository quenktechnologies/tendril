import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { compose, identity } from '@quenk/noni/lib/data/function';
import { Type } from '@quenk/noni/lib/data/type';

import { Action, Api, Context } from './';

/**
 * GetToken
 * @private
 */
export class GetToken<A> extends Api<A> {
    constructor(public next: (a: Type) => A) {
        super(next);
    }

    map<B>(f: (a: A) => B): GetToken<B> {
        return new GetToken(compose(this.next, f));
    }

    exec({ request }: Context<A>): Future<A> {
        let token = request.toExpress().csrfToken();
        return pure(this.next(token));
    }
}

/**
 * getToken provides the current CSRF token.
 */
export const getToken = (): Action<string> => liftF(new GetToken(identity));
