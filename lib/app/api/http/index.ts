/**
 * The http module provides the part of the api for sending http requests.
 */

/** imports */
import * as status from './status';
import * as express from 'express';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Future, pure, attempt } from '@quenk/noni/lib/control/monad/future';
import { Maybe, fromNullable, nothing } from '@quenk/noni/lib/data/maybe';
import { Err } from '@quenk/noni/lib/control/error';
import { Action, ActionM, Context } from '../';

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
 * Accepted response.
 */
export class Accepted<B, A> extends Response<B, A> {

    status = status.ACCEPTED;

    map<AA>(f: (a: A) => AA): Accepted<B, AA> {

        return new Accepted(this.body, f(this.next));

    }

}

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
 * Created response.
 */
export class Created<B, A> extends Response<B, A> {

    status = status.CREATED;

    map<AA>(f: (a: A) => AA): Created<B, AA> {

        return new Created(this.body, f(this.next));

    }

}

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
 * Unauthorized response.
 */
export class Unauthorized<B, A> extends Response<B, A> {

    status = status.UNAUTHORIZED;

    map<AA>(f: (a: A) => AA): Unauthorized<B, AA> {

        return new Unauthorized(this.body, f(this.next));

    }

}

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
 * NotFound response.
 */
export class NotFound<B, A> extends Response<B, A> {

    status = status.NOT_FOUND;

    map<AA>(f: (a: A) => AA): NotFound<B, AA> {

        return new NotFound(this.body, f(this.next));

    }

}

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
 * InternalServerError response.
 */
export class InternalServerError<A> extends Response<Err, A> {

    constructor(public body: Maybe<Err>, public next: A) {

        super(body, next);

    }

    status = status.INTERNAL_SERVER_ERROR;

    map<B>(f: (a: A) => B): InternalServerError<B> {

        return new InternalServerError(this.body, f(this.next));

    }

  exec({ response }: Context<A>): Future<A> {

        this.body.map(b => console.error(`Internal Error: ${b.message}`));

        return attempt(() => response.status(this.status))
            .map(() => this.next);

    }

}

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

const send = <B>(body: Maybe<B>, res: express.Response): void =>
    body
        .map(b => { res.send(b) })
        .orJust(() => { res.end() })
        .get();

/**
 * redirect the client to a new resource.
 */
export const redirect = (url: string, code: number): ActionM<undefined> =>
    liftF(new Redirect(url, code, undefined));

/**
 * ok sends the "OK" status to the client with optional body. 
 */
export const ok = <A>(body?: A): ActionM<undefined> =>
    liftF(new Ok(fromNullable(body), undefined));

/**
 * accepted sends the "ACCEPTED" status to the client with optional body.
 */
export const accepted = <A>(body: A): ActionM<undefined> =>
    liftF(new Accepted(fromNullable(body), undefined));

/**
 * noContent sends the "NO CONTENT" status to the client.
 */
export const noContent = (): ActionM<undefined> => 
  liftF(new NoContent(undefined));

/**
 * created sends the "CREATED" status to the client with optional body.
 */
export const created = <A>(body?: A): ActionM<undefined> =>
    liftF(new Created(fromNullable(body), undefined));

/**
 * badRequest sends the "BAD REQUEST" status to the client with optional body.
 */
export const badRequest = <A>(body?: A): ActionM<undefined> =>
    liftF(new BadRequest(fromNullable(body), undefined));

/**
 * unauthorized sends the "UNAUTHORIZED" status to the client with optional body.
 */
export const unauthorized = <A>(body?: A): ActionM<undefined> =>
    liftF(new Unauthorized(fromNullable(body), undefined));

/**
 * forbidden sends the "FORBIDDEN" status to the client with optional body.
 */
export const forbidden = <A>(body?: A): ActionM<undefined> =>
    liftF(new Forbidden(fromNullable(body), undefined));

/**
 * notFound sends the "NOT FOUND" status to the client with optional body.
 */
export const notFound = <A>(body?: A): ActionM<undefined>=>
    liftF(new NotFound(fromNullable(body), undefined));

/**
 * conflict sends the "CONFLICT" status to the client with optional body.
 */
export const conflict = <A>(body?: A): ActionM<undefined> =>
    liftF(new Conflict(fromNullable(body), undefined));

/**
 * error sends the "INTERNAL SERVER ERROR" status and can optionally log
 * the error to console.
 */
export const error = (err?: Err): ActionM<undefined> =>
    liftF(new InternalServerError(fromNullable(err), undefined));
