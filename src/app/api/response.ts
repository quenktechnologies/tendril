/**
 * The APIs here are used in app routes to send a response to clients.
 */

import * as express from 'express';

import {Value} from '@quenk/noni/lib/data/jsonx';

export const PRS_VIEW_CONTEXT = '$view.context';

export const OK = 200;
export const ACCEPTED = 202;
export const NO_CONTENT = 204;
export const CREATED = 201;
export const MOVED_PERMANENTLY = 301;
export const FOUND = 302;
export const SEE_OTHER = 303;
export const BAD_REQUEST = 400;
export const UNAUTHORIZED = 401;
export const FORBIDDEN = 403;
export const NOT_FOUND = 404;
export const CONFLICT = 409;
export const INTERNAL_SERVER_ERROR = 500;

/**
 * Status type representing an http status code.
 */
export type Status = number;

export type Transport = express.Response;

export type BodyValue = Value | object;

/**
 * Response is the parent of all the response classes.
 *
 * This class implements the logic for sending the response allowing child
 * classes to override the status and shape of the body if desired.
 */
export abstract class Response {
    constructor(public body?: BodyValue) {}

    /**
     * status code to send with the response.
     */
    abstract status: Status;

    async send(response: Transport) {
        let { status, body } = this;

        response.status(status);

        //TODO: add headers

        if (body) response.send(body);

        response.end();
    }
}

/**
 * Accepted response.
 */
export class Accepted extends Response {
    status = ACCEPTED;
}

/**
 * BadRequest response.
 */
export class BadRequest extends Response {
    status = BAD_REQUEST;
}

/**
 * Conflict response.
 */
export class Conflict extends Response {
    status = CONFLICT;
}

/**
 * Created response.
 */
export class Created extends Response {
    status = CREATED;
}

/**
 * NoContent response.
 */
export class NoContent extends Response {
    status = NO_CONTENT;
}
/**
 * Forbiddden response.
 */
export class Forbidden extends Response {
    status = FORBIDDEN;
}

/**
 * Unauthorized response.
 */
export class Unauthorized extends Response {
    status = UNAUTHORIZED;
}

/**
 * NotFound response.
 */
export class NotFound extends Response {
    status = NOT_FOUND;
}

/**
 * Ok action.
 */
export class Ok extends Response {
    status = OK;
}

/**
 * Redirect action.
 */
export class Redirect extends Response {
    constructor(
        public url: string,
        public status: Status
    ) {
        super();
    }

    async send(response: Transport) {
        response.redirect(this.url, this.status);
    }
}

/**
 * InternalServerError response.
 */
export class InternalServerError extends Response {
    status = INTERNAL_SERVER_ERROR;

    //TODO: emit internal error event, allow error logging etc.
}

/**
 * Show action.
 */
export class Show {
    constructor(
        public view: string,
        public status: Status,
        public context?: object
    ) {}

    /*
    async send(response: Transport) { 
        let { response, module, request } = ctx;
        let self = module.self;
        let mModule = Maybe.nothing<any>();

        //TODO: log error, dispatch event, return 500
        if (mModule.isNothing()) throw new Error(`${self}: Module not found!`);

        let mshow = mModule.get().show;

        //TODO: Same as previious TODO.
        if (mshow.isNothing())
            throw new Error(`${module.self}: ` + `No view engine configured!`);

        let f = mshow.get();
        let ctx0 = <object>request.prs.getOrElse(PRS_VIEW_CONTEXT, {});
        let ctx1 = this.context ?? {};

        let { view, status } = this;

        let c = await f(view, merge(ctx0, Object(ctx1)));
        response.set(headers.CONTENT_TYPE, c.type);
        response(status);
        response.write(c.content);
        response.end();
    }*/
}

/**
 * show triggers the view engine to display the content of the view referenced
 * by the parameter "view".
 *
 * @param view        - The template to generate content from.
 * @param context     - The context used when generating the view.
 * @param status      - The HTTP status to send with the response.
 */
export const show = (view: string, context?: object, status = 200) =>
    new Show(view, status, context);

/**
 * accepted sends the "ACCEPTED" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 */
export const accepted = (body?: BodyValue) => new Accepted(body);

/**
 * badRequest sends the "BAD REQUEST" status to the client with optional body.
 *
 * @param body        - Serializable data to be used as the response body.
 */
export const badRequest = (body?: BodyValue) => new BadRequest(body);

/**
 * conflict sends the "CONFLICT" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 */
export const conflict = (body?: BodyValue) => new Conflict(body);

/**
 * created sends the "CREATED" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 */
export const created = (body?: BodyValue) => new Created(body);

/**
 * unauthorized sends the "UNAUTHORIZED" status to the client with optional body.
 *
 * @param body        - Serializable data to be used as the response body.
 */
export const unauthorized = (body?: BodyValue) => new Unauthorized(body);

/**
 * internalError sends the "INTERNAL SERVER ERROR" status and can optionally log
 * the error to console.
 *
 * @param body        - Serializable data to be used as the response body.
 */
export const internalError = (body?: BodyValue) => new InternalServerError(body);

export { internalError as error };

/**
 * forbidden sends the "FORBIDDEN" status to the client with optional body.
 *
 * @param body        - Serializable data to be used as the response body.
 */
export const forbidden = (body?: BodyValue) => new Forbidden(body);

/**
 * noContent sends the "NO CONTENT" status to the client.
 */
export const noContent = () => new NoContent();

/**
 * notFound sends the "NOT FOUND" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 */
export const notFound = (body?: BodyValue) => new NotFound(body);

/**
 * ok sends the "OK" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 */
export const ok = (body?: BodyValue) => new Ok(body);

/**
 * redirect the client to a new resource.
 *
 * @param url         - The URL to redirect to.
 * @param code        - The HTTP status code to redirect with.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
export const redirect = (url: string, code: number) => new Redirect(url, code);
