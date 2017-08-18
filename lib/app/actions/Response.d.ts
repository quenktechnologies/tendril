import * as Promise from 'bluebird';
import { Context } from './Context';
import { Result } from './';
/**
 * Response terminates the http request with an actual HTTP response.
 */
export declare class Response<C> {
    body: any;
    status: number;
    constructor(body?: any);
    apply({response}: Context<C>): void;
}
export declare class Ok<C> extends Response<C> {
}
export declare class Accepted<C> extends Response<C> {
    status: number;
}
export declare class NoContent<C> extends Response<C> {
    status: number;
}
export declare class Created<C> extends Response<C> {
    status: number;
}
export declare class BadRequest<C> extends Response<C> {
    status: number;
}
export declare class Unauthorized<C> extends Response<C> {
    status: number;
}
export declare class Forbidden<C> extends Response<C> {
    status: number;
}
export declare class NotFound<C> extends Response<C> {
    status: number;
}
export declare class Conflict<C> extends Response<C> {
    status: number;
}
export declare class InternalServerError<C> extends Response<C> {
    body: Error;
    status: number;
    constructor(body: Error);
}
export declare class Status<C> {
    code: number;
    constructor(code: number);
    apply({response}: Context<C>): void;
}
export declare class Redirect<C> {
    url: string;
    code: number;
    constructor(url: string, code: number);
    apply({response}: Context<C>): void;
}
export declare class Render<A, C> {
    view: string;
    context: A;
    constructor(view: string, context: A);
    apply({module, response}: Context<C>): void;
}
export declare class Async<C> {
    f: () => Promise<Result<C>>;
    constructor(f: () => Promise<Result<C>>);
    apply(ctx: Context<C>): void;
}
