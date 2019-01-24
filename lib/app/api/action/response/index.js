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
var future_1 = require("@quenk/noni/lib/control/monad/future");
var __1 = require("../");
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
//# sourceMappingURL=index.js.map