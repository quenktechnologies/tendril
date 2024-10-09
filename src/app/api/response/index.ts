/**
 * This module provides functions for sending http responses.
 */

/** imports */
import * as headers from '../../../net/http/headers';
import * as status from './status';

import {
    Future,
    attempt,
    pure,
    raise,
    doFuture
} from '@quenk/noni/lib/control/monad/future';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import { Maybe, nothing, fromNullable } from '@quenk/noni/lib/data/maybe';
import { merge } from '@quenk/noni/lib/data/record';

import { getModule } from '../../module/data';
import { Api, Action, Context } from '../';
import { Type } from '@quenk/noni/lib/data/type';

export const PRS_VIEW_CONTEXT = '$view.context';

/**
 * Headers map.
 */
export interface Headers {
    [key: string]: string;
}

/**
 * Response terminates the http request with an actual HTTP response.
 */
export abstract class Response<B, A> extends Api<A> {
    constructor(
        public body: Maybe<B>,
        public abort: boolean,
        public next: A
    ) {
        super(next);
    }

    abstract status: status.Status;

    abstract map<AA>(f: (a: A) => AA): Response<B, AA>;

    marshal(body: B): Type {
        return body;
    }

    exec(ctx: Context<A>): Future<A> {
        let that = this;
        let { status, body, next } = that;

        return doFuture(function* () {
            yield attempt(() => ctx.response.status(status));

            if (body.isJust()) ctx.response.send(that.marshal(body.get()));

            ctx.response.end();

            return <Future<A>>(that.abort ? ctx.abort() : pure(next));
        });
    }
}

/**
 * Header sets header values to send out.
 */
export class Header<A> extends Api<A> {
    constructor(
        public headers: Headers,
        public next: A
    ) {
        super(next);
    }

    map<B>(f: (a: A) => B): Header<B> {
        return new Header(this.headers, f(this.next));
    }

    exec(ctx: Context<A>): Future<A> {
        ctx.response.set(this.headers);
        return pure(this.next);
    }
}

/**
 * Accepted response.
 */
export class Accepted<B, A> extends Response<B, A> {
    status = status.ACCEPTED;

    map<AA>(f: (a: A) => AA): Accepted<B, AA> {
        return new Accepted(this.body, this.abort, f(this.next));
    }
}

/**
 * BadRequest response.
 */
export class BadRequest<B, A> extends Response<B, A> {
    status = status.BAD_REQUEST;

    map<AA>(f: (a: A) => AA): BadRequest<B, AA> {
        return new BadRequest(this.body, this.abort, f(this.next));
    }
}

/**
 * Conflict response.
 */
export class Conflict<B, A> extends Response<B, A> {
    status = status.CONFLICT;

    map<AA>(f: (a: A) => AA): Conflict<B, AA> {
        return new Conflict(this.body, this.abort, f(this.next));
    }
}

/**
 * Created response.
 */
export class Created<B, A> extends Response<B, A> {
    status = status.CREATED;

    map<AA>(f: (a: A) => AA): Created<B, AA> {
        return new Created(this.body, this.abort, f(this.next));
    }
}

/**
 * InternalServerError response.
 */
export class InternalServerError<B, A> extends Response<B, A> {
    status = status.INTERNAL_SERVER_ERROR;

    marshal(value: B) {
        if (
            value instanceof Error &&
            !process.env.TENDRIL_DISABLE_500_ERROR_LOG
        )
            console.error(value);

        return process.env.TENDRIL_SEND_500_ERRORS ? value : '';
    }

    map<C>(f: (a: A) => C): InternalServerError<B, C> {
        return new InternalServerError(this.body, this.abort, f(this.next));
    }
}

/**
 * Forbiddden response.
 */
export class Forbidden<B, A> extends Response<B, A> {
    status = status.FORBIDDEN;

    map<AA>(f: (a: A) => AA): Forbidden<B, AA> {
        return new Forbidden(this.body, this.abort, f(this.next));
    }
}

/**
 * NoContent response.
 */
export class NoContent<A> extends Response<void, A> {
    constructor(
        public abort: boolean,
        public next: A
    ) {
        super(nothing(), abort, next);
    }

    status = status.NO_CONTENT;

    map<B>(f: (a: A) => B): NoContent<B> {
        return new NoContent(this.abort, f(this.next));
    }
}

/**
 * NotFound response.
 */
export class NotFound<B, A> extends Response<B, A> {
    status = status.NOT_FOUND;

    map<AA>(f: (a: A) => AA): NotFound<B, AA> {
        return new NotFound(this.body, this.abort, f(this.next));
    }
}

/**
 * Ok action.
 */
export class Ok<B, A> extends Response<B, A> {
    status = status.OK;

    map<AA>(f: (a: A) => AA): Ok<B, AA> {
        return new Ok(this.body, this.abort, f(this.next));
    }
}

/**
 * Redirect action.
 */
export class Redirect<A> extends Api<A> {
    constructor(
        public url: string,
        public code: number,
        public abort: boolean,
        public next: A
    ) {
        super(next);
    }

    map<B>(f: (a: A) => B): Redirect<B> {
        return new Redirect(this.url, this.code, this.abort, f(this.next));
    }

    exec(ctx: Context<A>): Future<A> {
        return attempt(() => ctx.response.redirect(this.url, this.code)).chain(
            () => <Future<A>>(this.abort ? ctx.abort() : pure(this.next))
        );
    }
}

/**
 * Unauthorized response.
 */
export class Unauthorized<B, A> extends Response<B, A> {
    status = status.UNAUTHORIZED;

    map<AA>(f: (a: A) => AA): Unauthorized<B, AA> {
        return new Unauthorized(this.body, this.abort, f(this.next));
    }
}

/**
 * Show action.
 */
export class Show<A, C> extends Api<A> {
    constructor(
        public view: string,
        public context: Maybe<C>,
        public status: status.Status,
        public abort: boolean,
        public next: A
    ) {
        super(next);
    }

    map<B>(f: (a: A) => B): Show<B, C> {
        return new Show(
            this.view,
            this.context,
            this.status,
            this.abort,
            f(this.next)
        );
    }

    exec(ctx: Context<A>): Future<A> {
        let that = this;
        let { response, module, request } = ctx;
        let self = module.self;
        let mModule = getModule(module.app.modules, self);

        if (mModule.isNothing())
            return raise<A>(new Error(`${self}: Module not found!`));

        let mshow = mModule.get().show;

        if (mshow.isNothing())
            return raise<A>(
                new Error(`${module.self}: ` + `No view engine configured!`)
            );

        let f = mshow.get();
        let ctx0 = <object>request.prs.getOrElse(PRS_VIEW_CONTEXT, {});
        let ctx1 = this.context.orJust(() => ({})).get();

        let { view, status, next } = this;

        return doFuture(function* () {
            let c = yield f(view, merge(ctx0, Object(ctx1)));
            response.set(headers.CONTENT_TYPE, c.type);
            response.status(status);
            response.write(c.content);
            response.end();
            return <Future<A>>(that.abort ? ctx.abort() : pure(next));
        });
    }
}

/**
 * header queues up on or more headers to send to the client.
 */
export const header = (list: Headers): Action<undefined> =>
    liftF(new Header(list, undefined));

/**
 * show triggers the view engine to display the content of the view referenced
 * by the parameter "view".
 *
 * @param view        - The template to generate content from.
 * @param context     - The context used when generating the view.
 * @param status      - The HTTP status to send with the response.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export const show = <C>(
    view: string,
    context?: C,
    status = 200,
    abort = true
): Action<undefined> =>
    liftF(new Show(view, fromNullable(context), status, abort, undefined));

/**
 * accepted sends the "ACCEPTED" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export const accepted = <A>(body?: A, abort = true): Action<undefined> =>
    liftF(new Accepted(fromNullable(body), abort, undefined));

/**
 * badRequest sends the "BAD REQUEST" status to the client with optional body.
 *
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export const badRequest = <A>(body?: A, abort = true): Action<undefined> =>
    liftF(new BadRequest(fromNullable(body), abort, undefined));

/**
 * conflict sends the "CONFLICT" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export const conflict = <A>(body?: A, abort = true): Action<undefined> =>
    liftF(new Conflict(fromNullable(body), abort, undefined));

/**
 * created sends the "CREATED" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export const created = <A>(body?: A, abort = true): Action<undefined> =>
    liftF(new Created(fromNullable(body), abort, undefined));

/**
 * unauthorized sends the "UNAUTHORIZED" status to the client with optional body.
 *
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export const unauthorized = <A>(body?: A, abort = true): Action<undefined> =>
    liftF(new Unauthorized(fromNullable(body), abort, undefined));

/**
 * internalError sends the "INTERNAL SERVER ERROR" status and can optionally log
 * the error to console.
 *
 * @param err        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export const internalError = (body?: object, abort = true): Action<undefined> =>
    liftF(new InternalServerError(fromNullable(body), abort, undefined));

export { internalError as error };

/**
 * forbidden sends the "FORBIDDEN" status to the client with optional body.
 *
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export const forbidden = <A>(body?: A, abort = true): Action<undefined> =>
    liftF(new Forbidden(fromNullable(body), abort, undefined));

/**
 * noContent sends the "NO CONTENT" status to the client.
 * @param abort      - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export const noContent = (abort = true): Action<undefined> =>
    liftF(new NoContent(abort, undefined));

/**
 * notFound sends the "NOT FOUND" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export const notFound = <A>(body?: A, abort = true): Action<undefined> =>
    liftF(new NotFound(fromNullable(body), abort, undefined));

/**
 * ok sends the "OK" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export const ok = <A>(body?: A, abort = true): Action<undefined> =>
    liftF(new Ok(fromNullable(body), abort, undefined));

/**
 * redirect the client to a new resource.
 *
 * @param url         - The URL to redirect to.
 * @param code        - The HTTP status code to redirect with.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export const redirect = (
    url: string,
    code: number,
    abort = true
): Action<undefined> => liftF(new Redirect(url, code, abort, undefined));
