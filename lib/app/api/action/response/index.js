"use strict";
/**
 * This module provides functions for sending http responses.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/** imports */
var status = require("./status");
var headers = require("../../../../net/http/headers");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var free_1 = require("@quenk/noni/lib/control/monad/free");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var __1 = require("../");
var data_1 = require("../../../module/data");
/**
 * Response terminates the http request with an actual HTTP response.
 */
var Response = /** @class */ (function (_super) {
    __extends(Response, _super);
    function Response(body, next) {
        var _this = _super.call(this, next) || this;
        _this.body = body;
        _this.next = next;
        return _this;
    }
    Response.prototype.exec = function (_a) {
        var _this = this;
        var response = _a.response;
        return future_1.attempt(function () { return response.status(_this.status); })
            .map(function () { return send(_this.body, response); })
            .map(function () { return _this.next; });
    };
    return Response;
}(__1.Action));
exports.Response = Response;
var send = function (body, res) {
    return body
        .map(function (b) { res.send(b); })
        .orJust(function () { res.end(); })
        .get();
};
/**
 * Header sets header values to send out.
 */
var Header = /** @class */ (function (_super) {
    __extends(Header, _super);
    function Header(headers, next) {
        var _this = _super.call(this, next) || this;
        _this.headers = headers;
        _this.next = next;
        return _this;
    }
    Header.prototype.map = function (f) {
        return new Header(this.headers, f(this.next));
    };
    Header.prototype.exec = function (ctx) {
        ctx.response.set(this.headers);
        return future_1.pure(this.next);
    };
    return Header;
}(__1.Action));
exports.Header = Header;
/**
 * header queues up on or more headers to send to the client.
 */
exports.header = function (list) {
    return free_1.liftF(new Header(list, undefined));
};
/**
 * Accepted response.
 */
var Accepted = /** @class */ (function (_super) {
    __extends(Accepted, _super);
    function Accepted() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = status.ACCEPTED;
        return _this;
    }
    Accepted.prototype.map = function (f) {
        return new Accepted(this.body, f(this.next));
    };
    return Accepted;
}(Response));
exports.Accepted = Accepted;
/**
 * accepted sends the "ACCEPTED" status to the client with optional body.
 */
exports.accepted = function (body) {
    return free_1.liftF(new Accepted(maybe_1.fromNullable(body), undefined));
};
/**
 * BadRequest response.
 */
var BadRequest = /** @class */ (function (_super) {
    __extends(BadRequest, _super);
    function BadRequest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = status.BAD_REQUEST;
        return _this;
    }
    BadRequest.prototype.map = function (f) {
        return new BadRequest(this.body, f(this.next));
    };
    return BadRequest;
}(Response));
exports.BadRequest = BadRequest;
/**
 * badRequest sends the "BAD REQUEST" status to the client with optional body.
 */
exports.badRequest = function (body) {
    return free_1.liftF(new BadRequest(maybe_1.fromNullable(body), undefined));
};
/**
 * Conflict response.
 */
var Conflict = /** @class */ (function (_super) {
    __extends(Conflict, _super);
    function Conflict() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = status.CONFLICT;
        return _this;
    }
    Conflict.prototype.map = function (f) {
        return new Conflict(this.body, f(this.next));
    };
    return Conflict;
}(Response));
exports.Conflict = Conflict;
/**
 * conflict sends the "CONFLICT" status to the client with optional body.
 */
exports.conflict = function (body) {
    return free_1.liftF(new Conflict(maybe_1.fromNullable(body), undefined));
};
/**
 * Created response.
 */
var Created = /** @class */ (function (_super) {
    __extends(Created, _super);
    function Created() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = status.CREATED;
        return _this;
    }
    Created.prototype.map = function (f) {
        return new Created(this.body, f(this.next));
    };
    return Created;
}(Response));
exports.Created = Created;
/**
 * created sends the "CREATED" status to the client with optional body.
 */
exports.created = function (body) {
    return free_1.liftF(new Created(maybe_1.fromNullable(body), undefined));
};
/**
 * InternalServerError response.
 */
var InternalServerError = /** @class */ (function (_super) {
    __extends(InternalServerError, _super);
    function InternalServerError(error, next) {
        var _this = _super.call(this, maybe_1.nothing(), next) || this;
        _this.error = error;
        _this.next = next;
        _this.status = status.INTERNAL_SERVER_ERROR;
        return _this;
    }
    InternalServerError.prototype.map = function (f) {
        return new InternalServerError(this.body, f(this.next));
    };
    return InternalServerError;
}(Response));
exports.InternalServerError = InternalServerError;
/**
 * error sends the "INTERNAL SERVER ERROR" status and can optionally log
 * the error to console.
 */
exports.error = function (err) {
    return free_1.liftF(new InternalServerError(maybe_1.fromNullable(err), undefined));
};
/**
 * Forbiddden response.
 */
var Forbidden = /** @class */ (function (_super) {
    __extends(Forbidden, _super);
    function Forbidden() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = status.FORBIDDEN;
        return _this;
    }
    Forbidden.prototype.map = function (f) {
        return new Forbidden(this.body, f(this.next));
    };
    return Forbidden;
}(Response));
exports.Forbidden = Forbidden;
/**
 * forbidden sends the "FORBIDDEN" status to the client with optional body.
 */
exports.forbidden = function (body) {
    return free_1.liftF(new Forbidden(maybe_1.fromNullable(body), undefined));
};
/**
 * NoContent response.
 */
var NoContent = /** @class */ (function (_super) {
    __extends(NoContent, _super);
    function NoContent(next) {
        var _this = _super.call(this, maybe_1.nothing(), next) || this;
        _this.next = next;
        _this.status = status.NO_CONTENT;
        return _this;
    }
    NoContent.prototype.map = function (f) {
        return new NoContent(f(this.next));
    };
    return NoContent;
}(Response));
exports.NoContent = NoContent;
/**
 * noContent sends the "NO CONTENT" status to the client.
 */
exports.noContent = function () {
    return free_1.liftF(new NoContent(undefined));
};
/**
 * NotFound response.
 */
var NotFound = /** @class */ (function (_super) {
    __extends(NotFound, _super);
    function NotFound() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = status.NOT_FOUND;
        return _this;
    }
    NotFound.prototype.map = function (f) {
        return new NotFound(this.body, f(this.next));
    };
    return NotFound;
}(Response));
exports.NotFound = NotFound;
/**
 * notFound sends the "NOT FOUND" status to the client with optional body.
 */
exports.notFound = function (body) {
    return free_1.liftF(new NotFound(maybe_1.fromNullable(body), undefined));
};
/**
 * Ok action.
 */
var Ok = /** @class */ (function (_super) {
    __extends(Ok, _super);
    function Ok() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = status.OK;
        return _this;
    }
    Ok.prototype.map = function (f) {
        return new Ok(this.body, f(this.next));
    };
    return Ok;
}(Response));
exports.Ok = Ok;
/**
 * ok sends the "OK" status to the client with optional body.
 */
exports.ok = function (body) {
    return free_1.liftF(new Ok(maybe_1.fromNullable(body), undefined));
};
/**
 * Redirect action.
 */
var Redirect = /** @class */ (function (_super) {
    __extends(Redirect, _super);
    function Redirect(url, code, next) {
        var _this = _super.call(this, next) || this;
        _this.url = url;
        _this.code = code;
        _this.next = next;
        return _this;
    }
    Redirect.prototype.map = function (f) {
        return new Redirect(this.url, this.code, f(this.next));
    };
    Redirect.prototype.exec = function (_a) {
        var _this = this;
        var response = _a.response;
        return future_1.attempt(function () { return response.redirect(_this.url, _this.code); })
            .chain(function () { return future_1.pure(_this.next); });
    };
    return Redirect;
}(__1.Action));
exports.Redirect = Redirect;
/**
 * redirect the client to a new resource.
 */
exports.redirect = function (url, code) {
    return free_1.liftF(new Redirect(url, code, undefined));
};
/**
 * Unauthorized response.
 */
var Unauthorized = /** @class */ (function (_super) {
    __extends(Unauthorized, _super);
    function Unauthorized() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = status.UNAUTHORIZED;
        return _this;
    }
    Unauthorized.prototype.map = function (f) {
        return new Unauthorized(this.body, f(this.next));
    };
    return Unauthorized;
}(Response));
exports.Unauthorized = Unauthorized;
/**
 * unauthorized sends the "UNAUTHORIZED" status to the client with optional body.
 */
exports.unauthorized = function (body) {
    return free_1.liftF(new Unauthorized(maybe_1.fromNullable(body), undefined));
};
/**
 * Show action.
 */
var Show = /** @class */ (function (_super) {
    __extends(Show, _super);
    function Show(view, context, status, next) {
        var _this = _super.call(this, next) || this;
        _this.view = view;
        _this.context = context;
        _this.status = status;
        _this.next = next;
        return _this;
    }
    Show.prototype.map = function (f) {
        return new Show(this.view, this.context, this.status, f(this.next));
    };
    Show.prototype.exec = function (_a) {
        var _this = this;
        var response = _a.response, module = _a.module;
        return data_1.getModule(module.system.modules, module.self())
            .chain(function (m) { return m.show; })
            .map(function (f) {
            return f(_this.view, _this.context.orJust(function () { return ({}); }).get())
                .chain(function (c) {
                response.set(headers.CONTENT_TYPE, c.type);
                response.status(_this.status);
                response.write(c.content);
                response.end();
                return future_1.pure(_this.next);
            });
        })
            .orJust(function () { return future_1.raise(new Error(module.self() + ": " +
            "No view engine configured!")); })
            .get();
    };
    return Show;
}(__1.Action));
exports.Show = Show;
/**
 * show the client some content.
 */
exports.show = function (view, context, status) {
    if (status === void 0) { status = 200; }
    return free_1.liftF(new Show(view, maybe_1.fromNullable(context), status, undefined));
};
//# sourceMappingURL=index.js.map