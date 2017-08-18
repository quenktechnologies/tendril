import * as http from '../../http';
import { Module } from '../Module';
import { Filter, Handler } from './';

/**
 * Context represents the context of the http request.
 *
 * It provides an api that assits with filtering the request and response.
 */
export class Context<C> {

    constructor(
        public request: http.Request,
        public response: http.Response,
        public filters: Filter<C>[],
        public handler: Handler<C>,
        public module: Module<C>) { }

    /**
     * next processes the next filter or action in the chain.
     */
    next(): void {

        return (this.filters.length > 0) ?
            this.filters.shift()(this.request).run(this) :
            this.handler(this.request).run(this);

    }

}


