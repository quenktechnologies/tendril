import * as status from './status';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { fromNullable } from '@quenk/noni/lib/data/maybe';
import { ActionM } from '../';
import { Response } from './';

/**
 * Conflict response.
 */
export class Conflict<B, A> extends Response<B, A> {

    status = status.CONFLICT;

    map<AA>(f: (a: A) => AA): Conflict<B, AA> {

        return new Conflict(this.body, f(this.next));

    }

}

/**
 * conflict sends the "CONFLICT" status to the client with optional body.
 */
export const conflict = <A>(body?: A): ActionM<undefined> =>
    liftF(new Conflict(fromNullable(body), undefined));
