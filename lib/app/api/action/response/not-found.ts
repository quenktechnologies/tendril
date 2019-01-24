import * as status from './status';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { fromNullable } from '@quenk/noni/lib/data/maybe';
import { ActionM } from '../';
import { Response } from './';

/**
 * NotFound response.
 */
export class NotFound<B, A> extends Response<B, A> {

    status = status.NOT_FOUND;

    map<AA>(f: (a: A) => AA): NotFound<B, AA> {

        return new NotFound(this.body, f(this.next));

    }

}

/**
 * notFound sends the "NOT FOUND" status to the client with optional body.
 */
export const notFound = <A>(body?: A): ActionM<undefined> =>
    liftF(new NotFound(fromNullable(body), undefined));
