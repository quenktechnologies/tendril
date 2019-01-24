/**
 * This module provides functions for sending http responses.
 */
/** imports */
import * as status from './status';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Context } from '../../context';
import { Action } from '../';
/**
 * Response terminates the http request with an actual HTTP response.
 */
export declare abstract class Response<B, A> extends Action<A> {
    body: Maybe<B>;
    next: A;
    constructor(body: Maybe<B>, next: A);
    abstract status: status.Status;
    abstract map<AA>(f: (a: A) => AA): Response<B, AA>;
    exec({ response }: Context<A>): Future<A>;
}
