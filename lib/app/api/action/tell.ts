import {  liftF } from '@quenk/noni/lib/control/monad/free';
import { Future, pure  } from '@quenk/noni/lib/control/monad/future';
import { Address } from '@quenk/potoo/lib/actor/address';
import { Message } from '@quenk/potoo/lib/actor/message';
import {Context} from '../context';
import {Action, ActionM} from './';

/**
 * Tell action.
 */
export class Tell<N, A> extends Action<A>{

    constructor(
        public to: Address,
        public message: Message,
        public next: A) { super(next); }

    map<B>(f: (a: A) => B): Tell<N, B> {

        return new Tell(this.to, this.message, f(this.next));

    }

    exec(ctx: Context<A>): Future<A> {

        return pure(ctx.module.tell(this.to, this.message))
            .map(() => this.next);

    }

}

/**
 * tell sends a message to another actor.
 */
export const tell = (to: string, m: Message): ActionM<undefined> =>
    liftF(new Tell(to, m, undefined));
