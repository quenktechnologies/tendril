import * as status from './status';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { fromNullable } from '@quenk/noni/lib/data/maybe';
import { ActionM } from '../';
import { Response } from './';

/**
 * Ok action.
 */
export class Ok<B, A> extends Response<B, A> {

    status = status.OK;

    map<AA>(f: (a: A) => AA): Ok<B, AA> {

        return new Ok(this.body, f(this.next));

    }

}

/**
 * ok sends the "OK" status to the client with optional body. 
 */
export const ok = <A>(body?: A): ActionM<undefined> =>
    liftF(new Ok(fromNullable(body), undefined));
