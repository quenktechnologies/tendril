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
import { Module } from '../module';
import { Request } from './request';


export class RequestContext {
    constructor(
        public actor: Module,
        public request: Request,
    ) {}
}
