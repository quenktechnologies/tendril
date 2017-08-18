import * as Response from './Response';
import * as http from '../../http';
import { Reader } from './Reader';
import { Context } from './Context';
export { Response, Context };
export declare type Result<C> = Reader<C>;
export interface Action<C> {
    apply(c: Context<C>): void;
}
/**
 * Filter are the functions that are run before the handling.
 */
export interface Filter<C> {
    (req: http.Request): Result<C>;
}
/**
 * Handler terminates the request.
 */
export interface Handler<C> {
    (req: http.Request): Result<C>;
}
export declare const status: (code: number) => Reader<{}>;
export declare const ok: <A>(body: A) => Reader<{}>;
export declare const accepted: <A>(body: A) => Reader<{}>;
export declare const noContent: () => Reader<{}>;
export declare const created: <A>(body: A) => Reader<{}>;
export declare const badRequest: <A>(body: A) => Reader<{}>;
export declare const unauthorized: <A>(body: A) => Reader<{}>;
export declare const forbidden: <A>(body: A) => Reader<{}>;
export declare const notFound: <A>(body: A) => Reader<{}>;
export declare const conflict: <A>(body: A) => Reader<{}>;
export declare const error: (err: Error) => Reader<{}>;
export declare const redirect: (url: string, code?: number) => Reader<{}>;
export declare const render: <A>(view: string, context?: A) => Reader<{}>;
