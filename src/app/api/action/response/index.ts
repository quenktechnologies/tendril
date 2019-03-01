/**
 * This module provides functions for sending http responses.
 */

/** imports */
import * as status from './status';
import * as express from 'express';
import { Future, attempt, pure } from '@quenk/noni/lib/control/monad/future';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Context } from '../../context';
import { Action, ActionM } from '../';

/**
 * Headers map.
 */
export interface Headers {

    [key: string]: string

}

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

/**
 * Header sets header values to send out.
 */
export class Header<A> extends Action<A> {

    constructor(public headers: Headers, public next: A) { super(next); }

    map<B>(f: (a: A) => B): Header<B> {

        return new Header(this.headers, f(this.next));

    }

    exec(ctx: Context<A>): Future<A> {

        ctx.response.set(this.headers);

        return pure(this.next);

    }

}

/**
 * header queues up on or more headers to send to the client.
 */
export const header = (list: Headers): ActionM<undefined> =>
    liftF(new Header(list, undefined));
