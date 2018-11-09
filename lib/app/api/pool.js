"use strict";
/**
 * Here you will find api functions for interacting with the application's
 * connection pool.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/** imports */
var future_1 = require("@quenk/noni/lib/control/monad/future");
var free_1 = require("@quenk/noni/lib/control/monad/free");
var function_1 = require("@quenk/noni/lib/data/function");
var _1 = require("./");
/**
 * Checkout action.
 */
var Checkout = /** @class */ (function (_super) {
    __extends(Checkout, _super);
    function Checkout(name, next) {
        var _this = _super.call(this, next) || this;
        _this.name = name;
        _this.next = next;
        return _this;
    }
    Checkout.prototype.map = function (f) {
        return new Checkout(this.name, function_1.compose(this.next, f));
    };
    Checkout.prototype.exec = function (_a) {
        var _this = this;
        var module = _a.module;
        return module.system.pool
            .get(this.name)
            .map(function (c) { return c.checkout().map(_this.next); })
            .orJust(function () { return future_1.raise(new Error("Unknown connection:\"" + _this.name + "\"!")); })
            .get();
    };
    return Checkout;
}(_1.Action));
exports.Checkout = Checkout;
/**
 * checkout a Connection from the application's pool.
 */
exports.checkout = function (name) {
    return free_1.liftF(new Checkout(name, function_1.identity));
};
//# sourceMappingURL=pool.js.map