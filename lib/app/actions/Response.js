"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("../../http");
/**
 * Response terminates the http request with an actual HTTP response.
 */
var Response = (function () {
    function Response(body) {
        this.body = body;
        this.status = http.Status.OK;
    }
    Response.prototype.apply = function (_a) {
        var response = _a.response;
        response.status(this.status);
        if (this.body)
            response.send(this.body);
        else
            response.end();
    };
    return Response;
}());
exports.Response = Response;
var Ok = (function (_super) {
    __extends(Ok, _super);
    function Ok() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Ok;
}(Response));
exports.Ok = Ok;
var Accepted = (function (_super) {
    __extends(Accepted, _super);
    function Accepted() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = http.Status.ACCEPTED;
        return _this;
    }
    return Accepted;
}(Response));
exports.Accepted = Accepted;
var NoContent = (function (_super) {
    __extends(NoContent, _super);
    function NoContent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = http.Status.NO_CONTENT;
        return _this;
    }
    return NoContent;
}(Response));
exports.NoContent = NoContent;
var Created = (function (_super) {
    __extends(Created, _super);
    function Created() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = http.Status.CREATED;
        return _this;
    }
    return Created;
}(Response));
exports.Created = Created;
var BadRequest = (function (_super) {
    __extends(BadRequest, _super);
    function BadRequest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = http.Status.BAD_REQUEST;
        return _this;
    }
    return BadRequest;
}(Response));
exports.BadRequest = BadRequest;
var Unauthorized = (function (_super) {
    __extends(Unauthorized, _super);
    function Unauthorized() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = http.Status.UNAUTHORIZED;
        return _this;
    }
    return Unauthorized;
}(Response));
exports.Unauthorized = Unauthorized;
var Forbidden = (function (_super) {
    __extends(Forbidden, _super);
    function Forbidden() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = http.Status.FORBIDDEN;
        return _this;
    }
    return Forbidden;
}(Response));
exports.Forbidden = Forbidden;
var NotFound = (function (_super) {
    __extends(NotFound, _super);
    function NotFound() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = http.Status.NOT_FOUND;
        return _this;
    }
    return NotFound;
}(Response));
exports.NotFound = NotFound;
var Conflict = (function (_super) {
    __extends(Conflict, _super);
    function Conflict() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = http.Status.CONFLICT;
        return _this;
    }
    return Conflict;
}(Response));
exports.Conflict = Conflict;
var InternalServerError = (function (_super) {
    __extends(InternalServerError, _super);
    function InternalServerError(body) {
        var _this = _super.call(this, body) || this;
        _this.body = body;
        _this.status = http.Status.INTERNAL_SERVER_ERROR;
        return _this;
    }
    InternalServerError.prototype.apply = function (c) {
        //Log internal errors to console
        //TODO: once we have actor support this will be sent
        //to an actor address.
        console.error(c);
        return _super.prototype.apply.call(this, c);
    };
    return InternalServerError;
}(Response));
exports.InternalServerError = InternalServerError;
var Status = (function () {
    function Status(code) {
        this.code = code;
    }
    Status.prototype.apply = function (_a) {
        var response = _a.response;
        response.status(this.code);
    };
    return Status;
}());
exports.Status = Status;
var Redirect = (function () {
    function Redirect(url, code) {
        this.url = url;
        this.code = code;
    }
    Redirect.prototype.apply = function (_a) {
        var response = _a.response;
        response.redirect(this.url, this.code);
    };
    return Redirect;
}());
exports.Redirect = Redirect;
var Render = (function () {
    function Render(view, context) {
        this.view = view;
        this.context = context;
    }
    Render.prototype.apply = function (_a) {
        var module = _a.module, response = _a.response;
        module
            .render(this.view, this.context)
            .then(function (view) {
            response.set(http.Headers.CONTENT_TYPE, view.contentType);
            response.write(view.content);
            response.end();
        });
    };
    return Render;
}());
exports.Render = Render;
var Async = (function () {
    function Async(f) {
        this.f = f;
    }
    Async.prototype.apply = function (ctx) {
        this.f().then(function (r) { return r.run(ctx); }).catch(function (e) { return ctx.module.onError(e); });
    };
    return Async;
}());
exports.Async = Async;
var Next = (function () {
    function Next(r) {
        this.r = r;
    }
    Next.prototype.apply = function (ctx) {
        ctx.next();
    };
    return Next;
}());
exports.Next = Next;
//# sourceMappingURL=Response.js.map