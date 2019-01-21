import * as uuid from 'uuid';
import { resolve } from 'path';
import { doN } from '@quenk/noni/lib/control/monad';
import { Future, Run, pure } from '@quenk/noni/lib/control/monad/future';
import { compose, identity } from '@quenk/noni/lib/data/function';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Constructor } from '@quenk/noni/lib/data/type/constructor';
import { Address } from '@quenk/potoo/lib/actor/address';
import { Message } from '@quenk/potoo/lib/actor/message';
import { Case } from '@quenk/potoo/lib/actor/resident/case';
import { Mutable, } from '@quenk/potoo/lib/actor/resident';
import { Context as AppContext } from '../../state/context';
import { App } from '../../../app';
import { Context } from '../context';
import { Action, ActionM } from './';

class Callback<A> extends Mutable<AppContext, App> {

    constructor(
        public pattern: Constructor<A>,
        public f: (a: A) => void,
        public app: App) { super(app); }

    run() {

        this.select([
          new Case(this.pattern, (a: A) => {
                this.f(a);
                this.exit();
            })
        ]);

    }

}

/**
 * Request wraps a message to an actor in to indicate a reply is
 * expected.
 */
export class Request<T> {

    constructor(
        public from: Address,
        public message: T) { }

}

/**
 * Response to a Request
 */
export class Response<T> {

    constructor(public value: T) { }

}

/**
 * Ask action.
 */
export class Ask<N, A> extends Action<A> {

    constructor(
        public to: Address,
        public message: Message,
        public next: (a: any) => A) { super(next); }

    map<B>(f: (a: A) => B): Ask<N, B> {

        return new Ask(this.to, this.message, compose(this.next, f));

    }

    exec(ctx: Context<A>): Future<A> {

        let { to, message, next } = this;

        return doN<A, Future<A>>(<() => Iterator<Future<A>>>function* () {

            const value = yield <Future<A>>new Run<Message>(s => {

                let id = uuid();
                let cb = (t: Message) => s.onSuccess(t.value);

                ctx.module.tell(to,
                    new Request(resolve(`${ctx.module.self()}/${id}`), message));

                ctx.module.spawn({
                    id,
                    create: a => new Callback(Response, cb, a)
                });

                return () => { }

            });

            return pure(next(value));

        });

    }

}

/**
 * ask sends a message to another actor and awaits a reply
 * before continuing computation.
 *
 * The actor must respond with a Response message.
 */
export const ask = <T>(to: Address, m: Message): ActionM<T> =>
    liftF(new Ask(to, m, identity));
