import * as express from 'express';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { Object } from '@quenk/noni/lib/data/jsonx';
import { Module } from '../module';
import { ActionM } from './action';
import { Filter } from './filter';
/**
 * Context represents the context of the http request.
 *
 * It provides an api that assists with filtering the request and response.
 */
export declare class Context<A> {
    module: Module;
    request: express.Request;
    response: express.Response;
    onError: express.NextFunction;
    filters: Filter<A>[];
    prs: Object;
    constructor(module: Module, request: express.Request, response: express.Response, onError: express.NextFunction, filters: Filter<A>[], prs?: Object);
    next(): Future<ActionM<A>>;
    /**
     * run processes the next filter or action in the chain.
     */
    run(): void;
}
