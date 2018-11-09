/**
 * 
 * The api module provides the functions, classes and types used to build
 * a responses to client requests in an app.
 *
 * We use a the Future class from noni for asynchrounous work and 
 * a Free monad based DSL for determining what to send the client.
 */

/** imports */
import * as express from 'express';
import * as headers from './http/headers';
import { Functor } from '@quenk/noni/lib/data/functor';
import { Free, liftF } from '@quenk/noni/lib/control/monad/free';
import { Future, pure, raise } from '@quenk/noni/lib/control/monad/future';
import { Maybe, fromNullable } from '@quenk/noni/lib/data/maybe';
import { noop } from '@quenk/noni/lib/data/function';
import { Module } from '../module';
import { getModule } from '../state/context';

/**
 * ActionM represents a sequence of actions the app takes
 * as a result of a client request.
 *
 * It is implemented as a DSL using the free monad.
 */
export type ActionM<A> = Free<Action<any>, A>;

/**
 * Filter functions are applied to the request
 * just before handling.
 */
export type Filter<A> = (r: Request) => Future<ActionM<A>>;

/**
 * Handler functions terminate the client request.
 */
export type Handler<A> = (r: Request) => Future<ActionM<A>>;

/**
 * Request represents a client request.
 */
export interface Request extends express.Request { }

/**
 * Context represents the context of the http request.
 * 
 * It provides an api that assits with filtering the request and response.
 */
export class Context<A> {

    constructor(
        public module: Module,
        public request: express.Request,
        public response: express.Response,
        public filters: Filter<A>[],
        public handler: Handler<A>) { }

    next(): Future<ActionM<A>> {

        let f = (this.filters.length > 0) ?
            <Filter<A>>this.filters.pop() :
            this.handler;

        return f(this.request);

    }

    /**
     * run processes the next filter or action in the chain.
     */
    run(): void {

        //@todo escalate errors
        this
            .next()
            .chain(n => n.foldM(() => pure<any>(noop()), n => n.exec(this)))
            .fork(console.error, console.log);

    }

}

/**
 * Action represents the result of a client request.
 *
 * It is implemented as a Functor DSL meant to be interpreted
 * later in a Free monad.
 */
export abstract class Action<A> implements Functor<A> {

    constructor(public next: A | (<X>(a: X) => A)) { }

    abstract map<B>(f: (n: A) => B): Action<B>;

    /**
     * exec the steps needed to produce the Action.
     */
    abstract exec(ctx: Context<A>): Future<A> | Future<ActionM<A>>;

}

/**
 * Next action.
 */
export class Next<A> extends Action<A> {

    constructor(public request: Request, public next: A) { super(next); }

    map<B>(f: (n: A) => B): Next<B> {

        return new Next(this.request, f(this.next));

    }

    exec(ctx: Context<A>): Future<ActionM<A>> {

        ctx.request = this.request;
        return ctx.next();

    }

}

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
 * next gives the go ahead to interpret the 
 * actions of the next Filter chain.
 *
 * This action allows the Request in the context to be modified and
 * short-circuits the current chain.
 */
export const next = (r: Request): ActionM<undefined> => liftF(new Next(r, undefined));

/**
 * show the client some content.
 */
export const show = <C>(view: string, context?: C): ActionM<undefined> =>
    liftF(new Show(view, fromNullable(context), undefined));

/**
 * wait on an asynchrounous operation to acquire the next
 * action to carry out.
 */
export const wait = (f: Future<ActionM<undefined>>): ActionM<undefined> =>
    liftF(new Wait(f, undefined));
