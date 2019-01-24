"use strict";
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
var status = require("./status");
var free_1 = require("@quenk/noni/lib/control/monad/free");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var _1 = require("./");
/**
 * InternalServerError response.
 */
var InternalServerError = /** @class */ (function (_super) {
    __extends(InternalServerError, _super);
    function InternalServerError(body, next) {
        var _this = _super.call(this, body, next) || this;
        _this.body = body;
        _this.next = next;
        _this.status = status.INTERNAL_SERVER_ERROR;
        return _this;
    }
    InternalServerError.prototype.map = function (f) {
        return new InternalServerError(this.body, f(this.next));
    };
    InternalServerError.prototype.exec = function (_a) {
        var _this = this;
        var response = _a.response;
        this.body.map(function (b) { return console.error("Internal Error: " + b.message); });
        return future_1.attempt(function () { return response.status(_this.status); })
            .map(function () { return _this.next; });
    };
    return InternalServerError;
}(_1.Response));
exports.InternalServerError = InternalServerError;
/**
 * error sends the "INTERNAL SERVER ERROR" status and can optionally log
 * the error to console.
 */
exports.error = function (err) {
    return free_1.liftF(new InternalServerError(maybe_1.fromNullable(err), undefined));
};
//# sourceMappingURL=error.js.map