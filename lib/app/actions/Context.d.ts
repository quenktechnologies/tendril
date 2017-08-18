import * as http from '../../http';
import { Module } from '../Module';
import { Filter, Handler } from './';
/**
 * Context represents the context of the http request.
 *
 * It provides an api that assits with filtering the request and response.
 */
export declare class Context<C> {
    request: http.Request;
    response: http.Response;
    filters: Filter<C>[];
    handler: Handler<C>;
    module: Module<C>;
    constructor(request: http.Request, response: http.Response, filters: Filter<C>[], handler: Handler<C>, module: Module<C>);
    /**
     * next processes the next filter or action in the chain.
     */
    next(): void;
}
