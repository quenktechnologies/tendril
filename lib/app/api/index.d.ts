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
import { Functor } from '@quenk/noni/lib/data/functor';
import { Free } from '@quenk/noni/lib/control/monad/free';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Module } from '../module';
/**
 * ActionM represents a sequence of actions the app takes
 * as a result of a client request.
 *
 * It is implemented as a DSL using the free monad.
 */
export declare type ActionM<A> = Free<Action<any>, A>;
/**
 * Filter functions are applied to the request
 * just before handling.
 */
export declare type Filter<A> = (r: Request) => Future<ActionM<A>>;
/**
 * Handler functions terminate the client request.
 */
export declare type Handler<A> = (r: Request) => Future<ActionM<A>>;
/**
 * Request represents a client request.
 */
export interface Request extends express.Request {
}
/**
 * Context represents the context of the http request.
 *
 * It provides an api that assits with filtering the request and response.
 */
export declare class Context<A> {
    module: Module;
    request: express.Request;
    response: express.Response;
    filters: Filter<A>[];
    handler: Handler<A>;
    constructor(module: Module, request: express.Request, response: express.Response, filters: Filter<A>[], handler: Handler<A>);
    next(): Future<ActionM<A>>;
    /**
     * run processes the next filter or action in the chain.
     */
    run(): void;
}
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
/**
 * Next action.
 */
export declare class Next<A> extends Action<A> {
    request: Request;
    next: A;
    constructor(request: Request, next: A);
    map<B>(f: (n: A) => B): Next<B>;
    exec(ctx: Context<A>): Future<ActionM<A>>;
}
/**
 * Show action.
 */
export declare class Show<A, C> extends Action<A> {
    view: string;
    context: Maybe<C>;
    next: A;
    constructor(view: string, context: Maybe<C>, next: A);
    map<B>(f: (a: A) => B): Show<B, C>;
    exec({ response, module }: Context<A>): Future<A>;
}
/**
 * Wait action.
 */
export declare class Wait<N, A> extends Action<A> {
    f: Future<ActionM<N>>;
    next: A;
    constructor(f: Future<ActionM<N>>, next: A);
    map<B>(f: (a: A) => B): Wait<N, B>;
    exec(ctx: Context<A>): Future<A>;
}
/**
 * next gives the go ahead to interpret the
 * actions of the next Filter chain.
 *
 * This action allows the Request in the context to be modified and
 * short-circuits the current chain.
 */
export declare const next: (r: Request) => Free<Action<any>, undefined>;
/**
 * show the client some content.
 */
export declare const show: <C>(view: string, context?: C | undefined) => Free<Action<any>, undefined>;
/**
 * wait on an asynchrounous operation to acquire the next
 * action to carry out.
 */
export declare const wait: (f: Future<Free<Action<any>, undefined>>) => Free<Action<any>, undefined>;
