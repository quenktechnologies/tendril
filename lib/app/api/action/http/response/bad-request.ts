
import * as status from '../status';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import {  fromNullable,  } from '@quenk/noni/lib/data/maybe';
import {ActionM} from '../../';
import {Response} from './';

/**
 * BadRequest response.
 */
export class BadRequest<B, A> extends Response<B, A> {

    status = status.BAD_REQUEST;

    map<AA>(f: (a: A) => AA): BadRequest<B, AA> {

        return new BadRequest(this.body, f(this.next));

    }

}

/**
 * badRequest sends the "BAD REQUEST" status to the client with optional body.
 */
export const badRequest = <A>(body?: A): ActionM<undefined> =>
    liftF(new BadRequest(fromNullable(body), undefined));
