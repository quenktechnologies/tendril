import { Functor } from '@quenk/noni/lib/data/functor';
import { Free } from '@quenk/noni/lib/control/monad/free';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Context } from '../context';
/**
 * ActionM represents a sequence of actions the app takes
 * as a result of a client request.
 *
 * It is implemented as a DSL using the free monad.
 */
export declare type ActionM<A> = Free<Action<any>, A>;
/**
 * Action represents the result of a client request.
 *
 * It is implemented as a Functor DSL meant to be interpreted
 * later in a Free monad.
 */
export declare abstract class Action<A> implements Functor<A> {
    next: A | (<X>(a: X) => A);
    constructor(next: A | (<X>(a: X) => A));
    abstract map<B>(f: (n: A) => B): Action<B>;
    /**
     * exec the steps needed to produce the Action.
     */
    abstract exec(ctx: Context<A>): Future<A> | Future<ActionM<A>>;
}
