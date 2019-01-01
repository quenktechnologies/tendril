import { Future } from '@quenk/noni/lib/control/monad/future';
import { Address } from '@quenk/potoo/lib/actor/address';
import { Message } from '@quenk/potoo/lib/actor/message';
import { Context } from '../context';
import { Action } from './';
/**
 * Request wraps a message to an actor in to indicate a reply is
 * expected.
 */
export declare class Request<T> {
    from: Address;
    message: T;
    constructor(from: Address, message: T);
}
/**
 * Response to a Request
 */
export declare class Response<T> {
    value: T;
    constructor(value: T);
}
/**
 * Ask action.
 */
export declare class Ask<N, A> extends Action<A> {
    to: Address;
    message: Message;
    next: (a: any) => A;
    constructor(to: Address, message: Message, next: (a: any) => A);
    map<B>(f: (a: A) => B): Ask<N, B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * ask sends a message to another actor and awaits a reply
 * before continuing computation.
 *
 * The actor must respond with a Response message.
 */
export declare const ask: <T>(to: string, m: any) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, T>;
