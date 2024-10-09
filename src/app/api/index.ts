/**
 * In tendril, web requests are handled by executing a sequence of one or more
 * operations called actions. This is implemented in such a way that users
 * of the framework do not directly respond to requests but rather give
 * instructions to the framework on what to do which the framework will
 * figure out by interpreting the API results.
 *
 * The flexibility of this approach allows us to introduce new features and
 * APIs to tendril without having to modify the Request object or drastically
 * changing the design of the framework. Actions are returned from handler
 * functions which are executed based on the routing configuration of
 * the application.
 *
 * The signature of those functions usually look like:
 *
 * ```
 * handler :: Request -> Action<void>
 * ```
 */
import * as express from 'express';

import { Functor } from '@quenk/noni/lib/data/functor';
import { Free, pure as freePure } from '@quenk/noni/lib/control/monad/free';
import { Future, pure, raise } from '@quenk/noni/lib/control/monad/future';
import { doN, DoFn } from '@quenk/noni/lib/control/monad';
import { Type } from '@quenk/noni/lib/data/type';

import { Module } from '../module';
import { Request, Filter } from './request';

/**
 * Action represents a sequence of actions the app takes
 * in response to a client request.
 *
 * Actions are implemented as an [[Api]] wrapped in a Free monad.
 */
export type Action<A> = Free<Api<Type>, A>;

/**
 * Context represents the context of the http request.
 *
 * This is an internal API not directly exposed to request handlers. It
 * stores lower level APIs used to execute the work of the higher level [[Api]]
 * objects.
 */
export class Context<A> {
    constructor(
        public module: Module,
        public request: Request,
        public response: express.Response,
        public onError: express.NextFunction,
        public filters: Filter<A>[]
    ) {}

    /**
     * abort the processing of filters for this Context.
     */
    abort(): Future<Action<A>> {
        this.filters = [];
        return pure(freePure(<Type>undefined));
    }

    /**
     * next provides the next Action to be interpreted.
     */
    next(): Future<Action<A>> {
        return this.filters.length > 0
            ? pure((<Filter<A>>this.filters.shift())(this.request))
            : raise(new Error(`${this.module.self}: No more filters!`));
    }

    /**
     * run processes the next filter or action in the chain.
     */
    run(): void {
        this.next()
            .chain(n =>
                n.foldM(
                    () => pure(<Type>undefined),
                    n => n.exec(this)
                )
            )
            .fork(this.onError, () => {});
    }
}

/**
 * Api represents an instruction to the tendril framework to carry out.
 *
 * An Api is usually an instruction to send a response to the requesting client
 * but are also used to interact with other APIs to do things like retrieve
 * a database connection from the connection pool for example.
 */
export abstract class Api<A> implements Functor<A> {
    constructor(public next: A | (<X>(a: X) => A)) {}

    abstract map<B>(f: (n: A) => B): Api<B>;

    /**
     * exec the steps needed to produce the Api.
     */
    abstract exec(ctx: Context<A>): Future<A> | Future<Action<A>>;
}

/**
 * doAction provides a do notation function specialized to Action
 * monads.
 *
 * Use this to chain Actions together using ES6's generator syntax.
 */
export const doAction = <A>(f: DoFn<A, Action<A>>) => doN(f);
