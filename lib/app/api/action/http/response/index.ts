/**
 * This module provides functions for sending http responses.
 */

/** imports */
import * as status from '../status';
import * as express from 'express';
import { Future, attempt } from '@quenk/noni/lib/control/monad/future';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Context } from '../../../context';
import { Action } from '../../';

/**
 * Response terminates the http request with an actual HTTP response.
 */
export abstract class Response<B, A> extends Action<A> {

    constructor(
        public body: Maybe<B>,
        public next: A) { super(next); }

    abstract status: status.Status;

    abstract map<AA>(f: (a: A) => AA): Response<B, AA>;

    exec({ response }: Context<A>): Future<A> {

        return attempt(() => response.status(this.status))
            .map(() => send(this.body, response))
            .map(() => this.next);

    }

}

const send = <B>(body: Maybe<B>, res: express.Response): void =>
    body
        .map(b => { res.send(b) })
        .orJust(() => { res.end() })
        .get();


