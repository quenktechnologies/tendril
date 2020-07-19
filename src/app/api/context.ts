import * as express from 'express';

import { Future, pure, raise } from '@quenk/noni/lib/control/monad/future';
import { noop } from '@quenk/noni/lib/data/function';
import { Object } from '@quenk/noni/lib/data/jsonx';

import { Module } from '../module';
import { Action, } from './action';
import { Filter } from './filter';

/**
 * Context represents the context of the http request.
 * 
 * It provides an api that assists with filtering the request and response.
 */
export class Context<A> {

    constructor(
        public module: Module,
        public request: express.Request,
        public response: express.Response,
        public onError: express.NextFunction,
        public filters: Filter<A>[],
        public prs: Object = {}) { }

    next(): Future<Action<A>> {

        return (this.filters.length > 0) ?
            pure((<Filter<A>>this.filters.shift())(this.request)) :
            raise(new Error(`${this.module.self()}: No more filters!`));

    }

    /**
     * run processes the next filter or action in the chain.
     */
    run(): void {

        this
            .next()
            .chain(n => n.foldM(() => pure<any>(noop()), n => n.exec(this)))
            .fork(this.onError, () => { });

    }

}
