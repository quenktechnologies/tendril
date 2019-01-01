import * as status from '../status';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import {  fromNullable  } from '@quenk/noni/lib/data/maybe';
import {ActionM} from '../../';
import {Response} from './';

/**
 * Forbiddden response.
 */
export class Forbidden<B, A> extends Response<B, A> {

    status = status.FORBIDDEN;

    map<AA>(f: (a: A) => AA): Forbidden<B, AA> {

        return new Forbidden(this.body, f(this.next));

    }

}

/**
 * forbidden sends the "FORBIDDEN" status to the client with optional body.
 */
export const forbidden = <A>(body?: A): ActionM<undefined> =>
    liftF(new Forbidden(fromNullable(body), undefined));
