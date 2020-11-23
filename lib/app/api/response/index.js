"use strict";
/**
 * This module provides functions for sending http responses.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirect = exports.ok = exports.notFound = exports.noContent = exports.forbidden = exports.error = exports.unauthorized = exports.created = exports.conflict = exports.badRequest = exports.accepted = exports.show = exports.header = exports.Show = exports.Unauthorized = exports.Redirect = exports.Ok = exports.NotFound = exports.NoContent = exports.Forbidden = exports.InternalServerError = exports.Created = exports.Conflict = exports.BadRequest = exports.Accepted = exports.Header = exports.Response = exports.PRS_VIEW_CONTEXT = void 0;
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
    constructor(body, next) {
        super(next);
        this.body = body;
        this.next = next;
    }
    exec({ response }) {
        return future_1.attempt(() => response.status(this.status))
            .map(() => send(this.body, response))
            .map(() => this.next);
    }
}
exports.Response = Response;
const send = (body, res) => body
    .map(b => { res.send(b); })
    .orJust(() => { res.end(); })
    .get();
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
        return new Accepted(this.body, f(this.next));
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
        return new BadRequest(this.body, f(this.next));
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
        return new Conflict(this.body, f(this.next));
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
        return new Created(this.body, f(this.next));
    }
}
exports.Created = Created;
/**
 * InternalServerError response.
 */
class InternalServerError extends Response {
    constructor(error, next) {
        super(maybe_1.nothing(), next);
        this.error = error;
        this.next = next;
        this.status = status.INTERNAL_SERVER_ERROR;
    }
    map(f) {
        return new InternalServerError(this.body, f(this.next));
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
        return new Forbidden(this.body, f(this.next));
    }
}
exports.Forbidden = Forbidden;
/**
 * NoContent response.
 */
class NoContent extends Response {
    constructor(next) {
        super(maybe_1.nothing(), next);
        this.next = next;
        this.status = status.NO_CONTENT;
    }
    map(f) {
        return new NoContent(f(this.next));
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
        return new NotFound(this.body, f(this.next));
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
        return new Ok(this.body, f(this.next));
    }
}
exports.Ok = Ok;
/**
 * Redirect action.
 */
class Redirect extends __1.Api {
    constructor(url, code, next) {
        super(next);
        this.url = url;
        this.code = code;
        this.next = next;
    }
    map(f) {
        return new Redirect(this.url, this.code, f(this.next));
    }
    exec({ response }) {
        return future_1.attempt(() => response.redirect(this.url, this.code))
            .chain(() => future_1.pure(this.next));
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
        return new Unauthorized(this.body, f(this.next));
    }
}
exports.Unauthorized = Unauthorized;
/**
 * Show action.
 */
class Show extends __1.Api {
    constructor(view, context, status, next) {
        super(next);
        this.view = view;
        this.context = context;
        this.status = status;
        this.next = next;
    }
    map(f) {
        return new Show(this.view, this.context, this.status, f(this.next));
    }
    exec({ response, module, request }) {
        let self = module.self();
        let mModule = data_1.getModule(module.system.modules, self);
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
            return future_1.pure(next);
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
 * show the client some content.
 */
const show = (view, context, status = 200) => free_1.liftF(new Show(view, maybe_1.fromNullable(context), status, undefined));
exports.show = show;
/**
 * accepted sends the "ACCEPTED" status to the client with optional body.
 */
const accepted = (body) => free_1.liftF(new Accepted(maybe_1.fromNullable(body), undefined));
exports.accepted = accepted;
/**
 * badRequest sends the "BAD REQUEST" status to the client with optional body.
 */
const badRequest = (body) => free_1.liftF(new BadRequest(maybe_1.fromNullable(body), undefined));
exports.badRequest = badRequest;
/**
 * conflict sends the "CONFLICT" status to the client with optional body.
 */
const conflict = (body) => free_1.liftF(new Conflict(maybe_1.fromNullable(body), undefined));
exports.conflict = conflict;
/**
 * created sends the "CREATED" status to the client with optional body.
 */
const created = (body) => free_1.liftF(new Created(maybe_1.fromNullable(body), undefined));
exports.created = created;
/**
 * unauthorized sends the "UNAUTHORIZED" status to the client with optional body.
 */
const unauthorized = (body) => free_1.liftF(new Unauthorized(maybe_1.fromNullable(body), undefined));
exports.unauthorized = unauthorized;
/**
 * error sends the "INTERNAL SERVER ERROR" status and can optionally log
 * the error to console.
 */
const error = (err) => free_1.liftF(new InternalServerError(maybe_1.fromNullable(err), undefined));
exports.error = error;
/**
 * forbidden sends the "FORBIDDEN" status to the client with optional body.
 */
const forbidden = (body) => free_1.liftF(new Forbidden(maybe_1.fromNullable(body), undefined));
exports.forbidden = forbidden;
/**
 * noContent sends the "NO CONTENT" status to the client.
 */
const noContent = () => free_1.liftF(new NoContent(undefined));
exports.noContent = noContent;
/**
 * notFound sends the "NOT FOUND" status to the client with optional body.
 */
const notFound = (body) => free_1.liftF(new NotFound(maybe_1.fromNullable(body), undefined));
exports.notFound = notFound;
/**
 * ok sends the "OK" status to the client with optional body.
 */
const ok = (body) => free_1.liftF(new Ok(maybe_1.fromNullable(body), undefined));
exports.ok = ok;
/**
 * redirect the client to a new resource.
 */
const redirect = (url, code) => free_1.liftF(new Redirect(url, code, undefined));
exports.redirect = redirect;
//# sourceMappingURL=index.js.map