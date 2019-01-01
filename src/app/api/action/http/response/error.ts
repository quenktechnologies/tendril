import * as status from '../status';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Future, attempt } from '@quenk/noni/lib/control/monad/future';
import { Maybe, fromNullable } from '@quenk/noni/lib/data/maybe';
import { Err } from '@quenk/noni/lib/control/error';
import {Context} from '../../../context';
import { ActionM } from '../../';
import { Response } from './';

/**
 * InternalServerError response.
 */
export class InternalServerError<A> extends Response<Err, A> {

    constructor(public body: Maybe<Err>, public next: A) {

        super(body, next);

    }

    status = status.INTERNAL_SERVER_ERROR;

    map<B>(f: (a: A) => B): InternalServerError<B> {

        return new InternalServerError(this.body, f(this.next));

    }

    exec({ response }: Context<A>): Future<A> {

        this.body.map(b => console.error(`Internal Error: ${b.message}`));

        return attempt(() => response.status(this.status))
            .map(() => this.next);

    }

}

/**
 * error sends the "INTERNAL SERVER ERROR" status and can optionally log
 * the error to console.
 */
export const error = (err?: Err): ActionM<undefined> =>
    liftF(new InternalServerError(fromNullable(err), undefined));
