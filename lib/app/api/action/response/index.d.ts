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
 * Headers map.
 */
export interface Headers {
    [key: string]: string;
}
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
/**
 * Header sets header values to send out.
 */
export declare class Header<A> extends Action<A> {
    headers: Headers;
    next: A;
    constructor(headers: Headers, next: A);
    map<B>(f: (a: A) => B): Header<B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * header queues up on or more headers to send to the client.
 */
export declare const header: (list: Headers) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
