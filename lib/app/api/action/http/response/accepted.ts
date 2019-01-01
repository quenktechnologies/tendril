import * as status from '../status';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { fromNullable } from '@quenk/noni/lib/data/maybe';
import { ActionM } from '../../';
import { Response } from './';

/**
 * Accepted response.
 */
export class Accepted<B, A> extends Response<B, A> {

    status = status.ACCEPTED;

    map<AA>(f: (a: A) => AA): Accepted<B, AA> {

        return new Accepted(this.body, f(this.next));

    }

}

/**
 * accepted sends the "ACCEPTED" status to the client with optional body.
 */
export const accepted = <A>(body: A): ActionM<undefined> =>
    liftF(new Accepted(fromNullable(body), undefined));
