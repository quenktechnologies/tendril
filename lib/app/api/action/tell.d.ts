import { Future } from '@quenk/noni/lib/control/monad/future';
import { Address } from '@quenk/potoo/lib/actor/address';
import { Message } from '@quenk/potoo/lib/actor/message';
import { Context } from '../context';
import { Action } from './';
/**
 * Tell action.
 */
export declare class Tell<N, A> extends Action<A> {
    to: Address;
    message: Message;
    next: A;
    constructor(to: Address, message: Message, next: A);
    map<B>(f: (a: A) => B): Tell<N, B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * tell sends a message to another actor.
 */
export declare const tell: (to: string, m: any) => import("@quenk/noni/lib/control/monad/free").Free<Action<any>, undefined>;
