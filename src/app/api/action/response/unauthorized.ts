import * as status from './status';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { fromNullable } from '@quenk/noni/lib/data/maybe';
import { ActionM } from '../';
import { Response } from './';

/**
 * Unauthorized response.
 */
export class Unauthorized<B, A> extends Response<B, A> {

    status = status.UNAUTHORIZED;

    map<AA>(f: (a: A) => AA): Unauthorized<B, AA> {

        return new Unauthorized(this.body, f(this.next));

    }

}

/**
 * unauthorized sends the "UNAUTHORIZED" status to the client with optional body.
 */
export const unauthorized = <A>(body?: A): ActionM<undefined> =>
    liftF(new Unauthorized(fromNullable(body), undefined));
