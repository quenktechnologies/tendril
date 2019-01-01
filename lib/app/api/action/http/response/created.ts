import * as status from '../status';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { fromNullable } from '@quenk/noni/lib/data/maybe';
import { ActionM } from '../../';
import { Response } from './';

/**
 * Created response.
 */
export class Created<B, A> extends Response<B, A> {

    status = status.CREATED;

    map<AA>(f: (a: A) => AA): Created<B, AA> {

        return new Created(this.body, f(this.next));

    }

}

/**
 * created sends the "CREATED" status to the client with optional body.
 */
export const created = <A>(body?: A): ActionM<undefined> =>
    liftF(new Created(fromNullable(body), undefined));
