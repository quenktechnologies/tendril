/**
 * In tendril, web requests are handled by executing a sequence of one or more
 * operations called `Api`. This is implemented in such a way that users
 * of the framework do not directly respond to requests but rather give
 * instructions to the framework on what steps to carry out.
 *
 * Think of this approach as an interpreter executing our Apis as its source
 * code.
 *
 * The flexibility of this approach allows us to introduce new features and
 * APIs to tendril without having to modify the Request object or drastically
 * changing the design of the framework.
 *
 * In tendril, a handler for a web request is simply a function in the Math
 * sense. The signature of that function may look like:
 *
 * ```
 * handler :: Request -> Api
 * ```
 *
 * However the "Apis" here are actually wrapped in a Free monad to allow
 * them to be chained together (thus allowing multiple Apis per request)
 *
 * This definition of handler looks like:
 *
 * ```
 * handler :: Request -> Free<Api, T>
 * ```
 * Where the generic type T is a placeholder for additional Apis in the chain
 * to be executed.
 *
 * Apis are usually created using API functions that automatically wrap the
 * Api in a Free on behalf of the user. They can be chained together using
 * the `chain` method or via yield expressions in a `doAction` block.
 */
import * as express from 'express';
import { Functor } from '@quenk/noni/lib/data/functor';
import { Free } from '@quenk/noni/lib/control/monad/free';
import { Object } from '@quenk/noni/lib/data/jsonx';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { DoFn } from '@quenk/noni/lib/control/monad';
import { Type } from '@quenk/noni/lib/data/type';
import { Module } from '../module';
import { Filter } from './request';
/**
 * Action represents a sequence of actions the app takes
 * in response to a client request.
 *
 * Actions are implemented as an Api wrapped in a Free monad.
 */
export declare type Action<A> = Free<Api<Type>, A>;
/**
 * Context represents the context of the http request.
 *
 * This is an internal API not directly exposed to request handlers. It
 * stores lower level APIs used to execute the work of the higher level Api
 * objects.
 */
export declare class Context<A> {
    module: Module;
    request: express.Request;
    response: express.Response;
    onError: express.NextFunction;
    filters: Filter<A>[];
    prs: Object;
    constructor(module: Module, request: express.Request, response: express.Response, onError: express.NextFunction, filters: Filter<A>[], prs?: Object);
    /**
     * next provides the next Action to be interpreted.
     */
    next(): Future<Action<A>>;
    /**
     * run processes the next filter or action in the chain.
     */
    run(): void;
}
/**
 * Api represents an instruction to the tendril framework to carry out.
 *
 * An Api is usually an instruction to send a response to the requesting client
 * but are also used to interact with other APIs to do things like retrieve
 * a database connection from the connection pool for example.
 */
export declare abstract class Api<A> implements Functor<A> {
    next: A | (<X>(a: X) => A);
    constructor(next: A | (<X>(a: X) => A));
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
export declare const doAction: <A>(f: DoFn<A, Action<A>>) => Action<A>;
