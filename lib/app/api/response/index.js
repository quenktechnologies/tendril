"use strict";
/**
 * This module provides functions for sending http responses.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirect = exports.ok = exports.notFound = exports.noContent = exports.forbidden = exports.error = exports.unauthorized = exports.created = exports.conflict = exports.badRequest = exports.accepted = exports.show = exports.header = exports.Show = exports.Unauthorized = exports.Redirect = exports.Ok = exports.NotFound = exports.NoContent = exports.Forbidden = exports.InternalServerError = exports.Created = exports.Conflict = exports.BadRequest = exports.Accepted = exports.Header = exports.Response = exports.PRS_VIEW_CONTEXT = void 0;
/** imports */
const headers = require("../../../net/http/headers");
const status = require("./status");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const free_1 = require("@quenk/noni/lib/control/monad/free");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const record_1 = require("@quenk/noni/lib/data/record");
const data_1 = require("../../module/data");
const __1 = require("../");
exports.PRS_VIEW_CONTEXT = '$view.context';
/**
 * Response terminates the http request with an actual HTTP response.
 */
class Response extends __1.Api {
    constructor(body, abort, next) {
        super(next);
        this.body = body;
        this.abort = abort;
        this.next = next;
    }
    exec(ctx) {
        let that = this;
        let { status, body, next } = that;
        return future_1.doFuture(function* () {
            yield future_1.attempt(() => ctx.response.status(status));
            if (body.isJust())
                ctx.response.send(body.get());
            ctx.response.end();
            return (that.abort ? ctx.abort : future_1.pure(next));
        });
    }
}
exports.Response = Response;
/**
 * Header sets header values to send out.
 */
class Header extends __1.Api {
    constructor(headers, next) {
        super(next);
        this.headers = headers;
        this.next = next;
    }
    map(f) {
        return new Header(this.headers, f(this.next));
    }
    exec(ctx) {
        ctx.response.set(this.headers);
        return future_1.pure(this.next);
    }
}
exports.Header = Header;
/**
 * Accepted response.
 */
class Accepted extends Response {
    constructor() {
        super(...arguments);
        this.status = status.ACCEPTED;
    }
    map(f) {
        return new Accepted(this.body, this.abort, f(this.next));
    }
}
exports.Accepted = Accepted;
/**
 * BadRequest response.
 */
class BadRequest extends Response {
    constructor() {
        super(...arguments);
        this.status = status.BAD_REQUEST;
    }
    map(f) {
        return new BadRequest(this.body, this.abort, f(this.next));
    }
}
exports.BadRequest = BadRequest;
/**
 * Conflict response.
 */
class Conflict extends Response {
    constructor() {
        super(...arguments);
        this.status = status.CONFLICT;
    }
    map(f) {
        return new Conflict(this.body, this.abort, f(this.next));
    }
}
exports.Conflict = Conflict;
/**
 * Created response.
 */
class Created extends Response {
    constructor() {
        super(...arguments);
        this.status = status.CREATED;
    }
    map(f) {
        return new Created(this.body, this.abort, f(this.next));
    }
}
exports.Created = Created;
/**
 * InternalServerError response.
 */
class InternalServerError extends Response {
    constructor(error, abort, next) {
        super(maybe_1.nothing(), abort, next);
        this.error = error;
        this.abort = abort;
        this.next = next;
        this.status = status.INTERNAL_SERVER_ERROR;
    }
    map(f) {
        return new InternalServerError(this.body, this.abort, f(this.next));
    }
}
exports.InternalServerError = InternalServerError;
/**
 * Forbiddden response.
 */
class Forbidden extends Response {
    constructor() {
        super(...arguments);
        this.status = status.FORBIDDEN;
    }
    map(f) {
        return new Forbidden(this.body, this.abort, f(this.next));
    }
}
exports.Forbidden = Forbidden;
/**
 * NoContent response.
 */
class NoContent extends Response {
    constructor(abort, next) {
        super(maybe_1.nothing(), abort, next);
        this.abort = abort;
        this.next = next;
        this.status = status.NO_CONTENT;
    }
    map(f) {
        return new NoContent(this.abort, f(this.next));
    }
}
exports.NoContent = NoContent;
/**
 * NotFound response.
 */
class NotFound extends Response {
    constructor() {
        super(...arguments);
        this.status = status.NOT_FOUND;
    }
    map(f) {
        return new NotFound(this.body, this.abort, f(this.next));
    }
}
exports.NotFound = NotFound;
/**
 * Ok action.
 */
class Ok extends Response {
    constructor() {
        super(...arguments);
        this.status = status.OK;
    }
    map(f) {
        return new Ok(this.body, this.abort, f(this.next));
    }
}
exports.Ok = Ok;
/**
 * Redirect action.
 */
class Redirect extends __1.Api {
    constructor(url, code, abort, next) {
        super(next);
        this.url = url;
        this.code = code;
        this.abort = abort;
        this.next = next;
    }
    map(f) {
        return new Redirect(this.url, this.code, this.abort, f(this.next));
    }
    exec(ctx) {
        return future_1.attempt(() => ctx.response.redirect(this.url, this.code))
            .chain(() => (this.abort ? ctx.abort() : future_1.pure(this.next)));
    }
}
exports.Redirect = Redirect;
/**
 * Unauthorized response.
 */
class Unauthorized extends Response {
    constructor() {
        super(...arguments);
        this.status = status.UNAUTHORIZED;
    }
    map(f) {
        return new Unauthorized(this.body, this.abort, f(this.next));
    }
}
exports.Unauthorized = Unauthorized;
/**
 * Show action.
 */
class Show extends __1.Api {
    constructor(view, context, status, abort, next) {
        super(next);
        this.view = view;
        this.context = context;
        this.status = status;
        this.abort = abort;
        this.next = next;
    }
    map(f) {
        return new Show(this.view, this.context, this.status, this.abort, f(this.next));
    }
    exec(ctx) {
        let that = this;
        let { response, module, request } = ctx;
        let self = module.self();
        let mModule = data_1.getModule(module.app.modules, self);
        if (mModule.isNothing())
            return future_1.raise(new Error(`${self}: Module not found!`));
        let mshow = mModule.get().show;
        if (mshow.isNothing())
            return future_1.raise(new Error(`${module.self()}: ` +
                `No view engine configured!`));
        let f = mshow.get();
        let ctx0 = request.prs.getOrElse(exports.PRS_VIEW_CONTEXT, {});
        let ctx1 = this.context.orJust(() => ({})).get();
        let { view, status, next } = this;
        return future_1.doFuture(function* () {
            let c = yield f(view, record_1.merge(ctx0, Object(ctx1)));
            response.set(headers.CONTENT_TYPE, c.type);
            response.status(status);
            response.write(c.content);
            response.end();
            return (that.abort ? ctx.abort() : future_1.pure(next));
        });
    }
}
exports.Show = Show;
/**
 * header queues up on or more headers to send to the client.
 */
const header = (list) => free_1.liftF(new Header(list, undefined));
exports.header = header;
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
const show = (view, context, status = 200, abort = true) => free_1.liftF(new Show(view, maybe_1.fromNullable(context), status, abort, undefined));
exports.show = show;
/**
 * accepted sends the "ACCEPTED" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
const accepted = (body, abort = true) => free_1.liftF(new Accepted(maybe_1.fromNullable(body), abort, undefined));
exports.accepted = accepted;
/**
 * badRequest sends the "BAD REQUEST" status to the client with optional body.
 *
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
const badRequest = (body, abort = true) => free_1.liftF(new BadRequest(maybe_1.fromNullable(body), abort, undefined));
exports.badRequest = badRequest;
/**
 * conflict sends the "CONFLICT" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
const conflict = (body, abort = true) => free_1.liftF(new Conflict(maybe_1.fromNullable(body), abort, undefined));
exports.conflict = conflict;
/**
 * created sends the "CREATED" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
const created = (body, abort = true) => free_1.liftF(new Created(maybe_1.fromNullable(body), abort, undefined));
exports.created = created;
/**
 * unauthorized sends the "UNAUTHORIZED" status to the client with optional body.
 *
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
const unauthorized = (body, abort = true) => free_1.liftF(new Unauthorized(maybe_1.fromNullable(body), abort, undefined));
exports.unauthorized = unauthorized;
/**
 * error sends the "INTERNAL SERVER ERROR" status and can optionally log
 * the error to console.
 *
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
const error = (err, abort = true) => free_1.liftF(new InternalServerError(maybe_1.fromNullable(err), abort, undefined));
exports.error = error;
/**
 * forbidden sends the "FORBIDDEN" status to the client with optional body.
 *
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
const forbidden = (body, abort = true) => free_1.liftF(new Forbidden(maybe_1.fromNullable(body), abort, undefined));
exports.forbidden = forbidden;
/**
 * noContent sends the "NO CONTENT" status to the client.
 * @param abort      - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
const noContent = (abort = true) => free_1.liftF(new NoContent(abort, undefined));
exports.noContent = noContent;
/**
 * notFound sends the "NOT FOUND" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
const notFound = (body, abort = true) => free_1.liftF(new NotFound(maybe_1.fromNullable(body), abort, undefined));
exports.notFound = notFound;
/**
 * ok sends the "OK" status to the client with optional body.
 * @param body        - Serializable data to be used as the response body.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
const ok = (body, abort = true) => free_1.liftF(new Ok(maybe_1.fromNullable(body), abort, undefined));
exports.ok = ok;
/**
 * redirect the client to a new resource.
 *
 * @param url         - The URL to redirect to.
 * @param code        - The HTTP status code to redirect with.
 * @param abort       - Flag indicating whether the response filter chain should
 *                      be terminated or not.
 */
const redirect = (url, code, abort = true) => free_1.liftF(new Redirect(url, code, abort, undefined));
exports.redirect = redirect;
//# sourceMappingURL=index.js.map