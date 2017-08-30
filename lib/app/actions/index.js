"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Response = require("./Response");
exports.Response = Response;
var http = require("../../http");
var Reader_1 = require("./Reader");
var Context_1 = require("./Context");
exports.Context = Context_1.Context;
exports.status = function (code) { return new Reader_1.Reader(function (c) { return (new Response.Status(code)).apply(c); }); };
exports.ok = function (body) { return new Reader_1.Reader(function (c) { return (new Response.Ok(body)).apply(c); }); };
exports.accepted = function (body) { return new Reader_1.Reader(function (c) { return (new Response.Accepted(body)).apply(c); }); };
exports.noContent = function () { return new Reader_1.Reader(function (c) { return (new Response.NoContent()).apply(c); }); };
exports.created = function (body) { return new Reader_1.Reader(function (c) { return (new Response.Created(body)).apply(c); }); };
exports.badRequest = function (body) { return new Reader_1.Reader(function (c) { return (new Response.BadRequest(body)).apply(c); }); };
exports.unauthorized = function (body) { return new Reader_1.Reader(function (c) { return (new Response.Unauthorized(body)).apply(c); }); };
exports.forbidden = function (body) { return new Reader_1.Reader(function (c) { return (new Response.Forbidden(body)).apply(c); }); };
exports.notFound = function (body) { return new Reader_1.Reader(function (c) { return (new Response.NotFound(body)).apply(c); }); };
exports.conflict = function (body) { return new Reader_1.Reader(function (c) { return (new Response.Conflict(body)).apply(c); }); };
exports.error = function (err) { return new Reader_1.Reader(function (c) { return (new Response.InternalServerError(err)).apply(c); }); };
exports.redirect = function (url, code) {
    if (code === void 0) { code = http.Status.FOUND; }
    return new Reader_1.Reader(function (c) { return (new Response.Redirect(url, code)).apply(c); });
};
exports.render = function (view, context) { return new Reader_1.Reader(function (c) { return (new Response.Render(view, context || {})).apply(c); }); };
exports.async = function (f) { return new Reader_1.Reader(function (c) { return (new Response.Async(f)).apply(c); }); };
exports.next = function (r) { return new Reader_1.Reader(function (c) { return (new Response.Next(r)).apply(c); }); };
//# sourceMappingURL=index.js.map