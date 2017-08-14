"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Result
 */
var Result = (function () {
    function Result(renderer, response) {
        this.renderer = renderer;
        this.response = response;
    }
    Result.prototype.send = function (code, body) {
        this.response.status(code);
        if (body)
            this.response.send(body);
        return this;
    };
    Result.prototype.status = function (code) {
        this.response.status(code);
        return this;
    };
    Result.prototype.ok = function (body) {
        return this.send(200, body);
    };
    Result.prototype.accepted = function () {
        return this.send(202);
    };
    Result.prototype.noContent = function () {
        return this.send(204);
    };
    Result.prototype.created = function (body) {
        return this.send(201, body);
    };
    Result.prototype.badRequest = function (body) {
        return this.send(400, body);
    };
    Result.prototype.unauthorized = function (body) {
        return this.send(401, body);
    };
    Result.prototype.forbidden = function (body) {
        return this.send(403, body);
    };
    Result.prototype.notFound = function (body) {
        return this.send(404, body);
    };
    Result.prototype.conflict = function (body) {
        return this.send(409, body);
    };
    Result.prototype.error = function (err) {
        console.error(err.stack ? err.stack : err);
        return this.send(500);
    };
    Result.prototype.redirect = function (url, code) {
        if (code === void 0) { code = 302; }
        this.response.redirect(url, code);
        return this;
    };
    Result.prototype.render = function (view, context) {
        var _this = this;
        return this.renderer.render(view, context || {})
            .then(function (v) {
            _this.response.set('Content-Type', v.contentType || 'text/html');
            _this.ok(v.content);
        });
    };
    return Result;
}());
exports.Result = Result;
//# sourceMappingURL=Result.js.map