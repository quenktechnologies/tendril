
import {  liftF } from '@quenk/noni/lib/control/monad/free';
import { Future, pure  } from '@quenk/noni/lib/control/monad/future';
import { noop   } from '@quenk/noni/lib/data/function';
import {Context} from '../context';
import {Action, ActionM} from './';

/**
 * Wait action.
 */
export class Wait<N, A> extends Action<A>{

    constructor(
        public f: Future<ActionM<N>>,
        public next: A) { super(next); }

    map<B>(f: (a: A) => B): Wait<N, B> {

        return new Wait(this.f, f(this.next));

    }

    exec(ctx: Context<A>): Future<A> {

        return this.f.chain(n =>
            n.foldM(() => pure<any>(noop()), n => n.exec(ctx)))
            .chain(() => pure(this.next));

    }

}

/**
 * wait on an asynchrounous operation to acquire the next
 * action to carry out.
 */
export const wait = (f: Future<ActionM<undefined>>): ActionM<undefined> =>
    liftF(new Wait(f, undefined));
