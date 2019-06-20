/**
 * This module provides functions for sending http responses.
 */

/** imports */
import * as status from './status';
import * as express from 'express';
import * as headers from '../../../../net/http/headers';
import { Future, attempt, pure, raise } from '@quenk/noni/lib/control/monad/future';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Err } from '@quenk/noni/lib/control/error';
import { Maybe, nothing, fromNullable } from '@quenk/noni/lib/data/maybe';
import { Context } from '../../context';
import { Action, ActionM } from '../';
import { getModule } from '../../../actor/context';

/**
 * Headers map.
 */
export interface Headers {

    [key: string]: string

}

/**
 * Response terminates the http request with an actual HTTP response.
 */
export abstract class Response<B, A> extends Action<A> {

    constructor(
        public body: Maybe<B>,
        public next: A) { super(next); }

    abstract status: status.Status;

    abstract map<AA>(f: (a: A) => AA): Response<B, AA>;

    exec({ response }: Context<A>): Future<A> {

        return attempt(() => response.status(this.status))
            .map(() => send(this.body, response))
            .map(() => this.next);

    }

}

const send = <B>(body: Maybe<B>, res: express.Response): void =>
    body
        .map(b => { res.send(b) })
        .orJust(() => { res.end() })
        .get();

/**
 * Header sets header values to send out.
 */
export class Header<A> extends Action<A> {

    constructor(public headers: Headers, public next: A) { super(next); }

    map<B>(f: (a: A) => B): Header<B> {

        return new Header(this.headers, f(this.next));

    }

    exec(ctx: Context<A>): Future<A> {

        ctx.response.set(this.headers);

        return pure(this.next);

    }

}

/**
 * header queues up on or more headers to send to the client.
 */
export const header = (list: Headers): ActionM<undefined> =>
    liftF(new Header(list, undefined));

/**
 * Accepted response.
 */
export class Accepted<B, A> extends Response<B, A> {

    status = status.ACCEPTED;

    map<AA>(f: (a: A) => AA): Accepted<B, AA> {

        return new Accepted(this.body, f(this.next));

    }

}

/**
 * accepted sends the "ACCEPTED" status to the client with optional body.
 */
export const accepted = <A>(body: A): ActionM<undefined> =>
    liftF(new Accepted(fromNullable(body), undefined));

/**
 * BadRequest response.
 */
export class BadRequest<B, A> extends Response<B, A> {

    status = status.BAD_REQUEST;

    map<AA>(f: (a: A) => AA): BadRequest<B, AA> {

        return new BadRequest(this.body, f(this.next));

    }

}

/**
 * badRequest sends the "BAD REQUEST" status to the client with optional body.
 */
export const badRequest = <A>(body?: A): ActionM<undefined> =>
    liftF(new BadRequest(fromNullable(body), undefined));

/**
 * Conflict response.
 */
export class Conflict<B, A> extends Response<B, A> {

    status = status.CONFLICT;

    map<AA>(f: (a: A) => AA): Conflict<B, AA> {

        return new Conflict(this.body, f(this.next));

    }

}

/**
 * conflict sends the "CONFLICT" status to the client with optional body.
 */
export const conflict = <A>(body?: A): ActionM<undefined> =>
    liftF(new Conflict(fromNullable(body), undefined));

/**
 * Created response.
 */
export class Created<B, A> extends Response<B, A> {

    status = status.CREATED;

    map<AA>(f: (a: A) => AA): Created<B, AA> {

        return new Created(this.body, f(this.next));

    }

}

/**
 * created sends the "CREATED" status to the client with optional body.
 */
export const created = <A>(body?: A): ActionM<undefined> =>
    liftF(new Created(fromNullable(body), undefined));

/**
 * InternalServerError response.
 */
export class InternalServerError<A> extends Response<Err, A> {

    constructor(public error: Maybe<Err>, public next: A) {

        super(nothing(), next);

    }

    status = status.INTERNAL_SERVER_ERROR;

    map<B>(f: (a: A) => B): InternalServerError<B> {

        return new InternalServerError(this.body, f(this.next));

    }

}

/**
 * error sends the "INTERNAL SERVER ERROR" status and can optionally log
 * the error to console.
 */
export const error = (err?: Err): ActionM<undefined> =>
    liftF(new InternalServerError(fromNullable(err), undefined));

/**
 * Forbiddden response.
 */
export class Forbidden<B, A> extends Response<B, A> {

    status = status.FORBIDDEN;

    map<AA>(f: (a: A) => AA): Forbidden<B, AA> {

        return new Forbidden(this.body, f(this.next));

    }

}

/**
 * forbidden sends the "FORBIDDEN" status to the client with optional body.
 */
export const forbidden = <A>(body?: A): ActionM<undefined> =>
    liftF(new Forbidden(fromNullable(body), undefined));

/**
 * NoContent response.
 */
export class NoContent<A> extends Response<void, A> {

    constructor(public next: A) { super(nothing(), next); }

    status = status.NO_CONTENT;

    map<B>(f: (a: A) => B): NoContent<B> {

        return new NoContent(f(this.next));

    }

}

/**
 * noContent sends the "NO CONTENT" status to the client.
 */
export const noContent = (): ActionM<undefined> =>
    liftF(new NoContent(undefined));

/**
 * NotFound response.
 */
export class NotFound<B, A> extends Response<B, A> {

    status = status.NOT_FOUND;

    map<AA>(f: (a: A) => AA): NotFound<B, AA> {

        return new NotFound(this.body, f(this.next));

    }

}

/**
 * notFound sends the "NOT FOUND" status to the client with optional body.
 */
export const notFound = <A>(body?: A): ActionM<undefined> =>
    liftF(new NotFound(fromNullable(body), undefined));

/**
 * Ok action.
 */
export class Ok<B, A> extends Response<B, A> {

    status = status.OK;

    map<AA>(f: (a: A) => AA): Ok<B, AA> {

        return new Ok(this.body, f(this.next));

    }

}

/**
 * ok sends the "OK" status to the client with optional body. 
 */
export const ok = <A>(body?: A): ActionM<undefined> =>
    liftF(new Ok(fromNullable(body), undefined));

/**
 * Redirect action.
 */
export class Redirect<A> extends Action<A> {

    constructor(
        public url: string,
        public code: number,
        public next: A) { super(next); }

    map<B>(f: (a: A) => B): Redirect<B> {

        return new Redirect(this.url, this.code, f(this.next));

    }

    exec({ response }: Context<A>): Future<A> {

        return attempt(() => response.redirect(this.url, this.code))
            .chain(() => pure(this.next));

    }

}

/**
 * redirect the client to a new resource.
 */
export const redirect = (url: string, code: number): ActionM<undefined> =>
    liftF(new Redirect(url, code, undefined));

/**
 * Unauthorized response.
 */
export class Unauthorized<B, A> extends Response<B, A> {

    status = status.UNAUTHORIZED;

    map<AA>(f: (a: A) => AA): Unauthorized<B, AA> {

        return new Unauthorized(this.body, f(this.next));

    }

}

/**
 * unauthorized sends the "UNAUTHORIZED" status to the client with optional body.
 */
export const unauthorized = <A>(body?: A): ActionM<undefined> =>
    liftF(new Unauthorized(fromNullable(body), undefined));

/**
 * Show action.
 */
export class Show<A, C> extends Action<A> {

    constructor(
        public view: string,
        public context: Maybe<C>,
        public status: status.Status,
        public next: A) { super(next); }

    map<B>(f: (a: A) => B): Show<B, C> {

        return new Show(this.view, this.context, this.status, f(this.next));

    }

    exec({ response, module }: Context<A>): Future<A> {

        return getModule(module.system.state, module.self())
            .chain(m => m.show)
            .map(f =>
                f(this.view, <any>this.context.orJust(() => ({})).get())
                    .chain(c => {

                        response.set(headers.CONTENT_TYPE, c.type);
                        response.status(this.status);
                        response.write(c.content);
                        response.end();

                        return pure(this.next);

                    }))
            .orJust(() => raise<A>(new Error(`${module.self()}: ` +
                `No view engine configured!`)))
            .get();

    }

}

/**
 * show the client some content.
 */
export const show = <C>
    (view: string, context?: C, status = 200): ActionM<undefined> =>
    liftF(new Show(view, fromNullable(context), status, undefined));
