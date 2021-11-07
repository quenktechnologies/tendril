import * as uuid from 'uuid';
import { resolve } from 'path';

import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Future, Run, pure } from '@quenk/noni/lib/control/monad/future';
import { compose, identity } from '@quenk/noni/lib/data/function';
import { Constructor } from '@quenk/noni/lib/data/type/constructor';
import { Temp } from '@quenk/potoo/lib/actor/resident';
import { Address } from '@quenk/potoo/lib/actor/address';
import { Message } from '@quenk/potoo/lib/actor/message';
import { Case } from '@quenk/potoo/lib/actor/resident/case';

import { App } from '../../../app';
import { Api, Action, Context } from '../';

/**
 * Self
 * @private
 */
export class Self<N, A> extends Api<A> {

    constructor(public next: (a: any) => A) { super(next); }

    map<B>(f: (a: A) => B): Self<N, B> {

        return new Self(compose(this.next, f));

    }

    exec(ctx: Context<A>): Future<A> {

        return pure(this.next(ctx.module.self()));

    }

}

/**
 * Tell 
 * @private
 */
export class Tell<N, A> extends Api<A>{

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

class Callback<A> extends Temp<A> {

    constructor(
        public pattern: Constructor<A>,
        public f: (a: A) => void,
        public app: App) { super(app); }

    receive() {

        return [new Case(this.pattern, (a: A) => { this.f(a); })        ];

    }

    run() {

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
 * Ask
 * @private
 */
export class Ask<N, A> extends Api<A> {

    constructor(
        public to: Address,
        public message: Message,
        public next: (a: any) => A) { super(next); }

    map<B>(f: (a: A) => B): Ask<N, B> {

        return new Ask(this.to, this.message, compose(this.next, f));

    }

    exec(ctx: Context<A>): Future<A> {

        let { to, message, next } = this;

        return (<Future<A>>new Run<Message>((_, onSuccess) => {

            let id = uuid.v4();
            let cb = (t: Message) => onSuccess(t.value);

            ctx.module.spawn({
                id,
                create: a => new Callback(Response, cb, <App>a)
            });

            ctx.module.tell(to,
                new Request(resolve(`${ctx.module.self()}/${id}`), message));

            return () => { }

        }))
            .chain(v => pure(next(v)));

    }

}

/**
 * ask sends a message to another actor and awaits a reply
 * before continuing computation.
 *
 * The actor must respond with a Response message.
 */
export const ask = <T>(to: Address, m: Message): Action<T> =>
    liftF(new Ask(to, m, identity));

/**
 * self provides the address of the module.
 */
export const self = (): Action<Address> =>
    liftF(new Self(identity));

/**
 * tell sends a message to another actor.
 */
export const tell = (to: string, m: Message): Action<undefined> =>
    liftF(new Tell(to, m, undefined));
