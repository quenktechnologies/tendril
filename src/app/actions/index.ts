import * as Response from './Response';
import * as http from '../../http';
import { Reader } from './Reader';
import { Context } from './Context';

export { Response, Context };

export type Result<C>
    = Reader<C>
    ;

export interface Action<C> {

    apply(c: Context<C>): void;

}

/**
 * Filter are the functions that are run before the handling.
 */
export interface Filter<C> {

    (req: http.Request): Result<C>

}

/**
 * Handler terminates the request.
 */
export interface Handler<C> {

    (req: http.Request): Result<C>

}

export const status = (code: number) => new Reader(c => (new Response.Status(code)).apply(c));

export const ok = <A>(body: A) => new Reader(c => (new Response.Ok(body)).apply(c));

export const accepted = <A>(body: A) => new Reader(c => (new Response.Accepted(body)).apply(c));

export const noContent = () => new Reader(c => (new Response.NoContent()).apply(c));

export const created = <A>(body: A) => new Reader(c => (new Response.Created(body)).apply(c));

export const badRequest = <A>(body: A) => new Reader(c => (new Response.BadRequest(body)).apply(c));

export const unauthorized = <A>(body: A) => new Reader(c => (new Response.Unauthorized(body)).apply(c));

export const forbidden = <A>(body: A) => new Reader(c => (new Response.Forbidden(body)).apply(c));

export const notFound = <A>(body: A) => new Reader(c => (new Response.NotFound(body)).apply(c));

export const conflict = <A>(body: A) => new Reader(c => (new Response.Conflict(body)).apply(c));

export const error = (err: Error) => new Reader(c => (new Response.InternalServerError(err)).apply(c));

export const redirect = (url: string, code: number = http.Status.FOUND) => new Reader(c => (new Response.Redirect(url, code)).apply(c));

export const render = <A>(view: string, context?: A) => new Reader(c => (new Response.Render(view, context || {})).apply(c));
