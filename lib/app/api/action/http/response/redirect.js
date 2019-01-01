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
var free_1 = require("@quenk/noni/lib/control/monad/free");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var __1 = require("../..");
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
//# sourceMappingURL=redirect.js.map