import * as express from 'express';
import { Future } from '@quenk/noni/lib/control/monad/future';
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
    filters: Filter<A>[];
    constructor(module: Module, request: express.Request, response: express.Response, filters: Filter<A>[]);
    next(): Future<ActionM<A>>;
    /**
     * run processes the next filter or action in the chain.
     */
    run(): void;
}
