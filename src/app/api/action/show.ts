import * as headers from '../../../net/http/headers';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Future, pure, raise } from '@quenk/noni/lib/control/monad/future';
import { Maybe, fromNullable } from '@quenk/noni/lib/data/maybe';
import { getModule } from '../../state/context';
import { Context } from '../context';
import { Action,ActionM } from './';
/**
 * Show action.
 */
export class Show<A, C> extends Action<A> {

    constructor(
        public view: string,
        public context: Maybe<C>,
        public next: A) { super(next); }

    map<B>(f: (a: A) => B): Show<B, C> {

        return new Show(this.view, this.context, f(this.next));

    }

    exec({ response, module }: Context<A>): Future<A> {

        return getModule(module.system.state, module.self())
            .chain(m => m.show)
            .map(f =>
                f(this.view, this.context)
                    .chain(c => {

                        response.set(headers.CONTENT_TYPE, c.type);
                        response.write(c.content);
                        response.end();

                        return pure(this.next);

                    }))
            .orJust(() => raise<A>(new Error(`${module.self()}: ` +
                `No view engine configured!`)))
            .get();

    }

}

/**
 * show the client some content.
 */
export const show = <C>(view: string, context?: C): ActionM<undefined> =>
    liftF(new Show(view, fromNullable(context), undefined));
