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
var function_1 = require("@quenk/noni/lib/data/function");
var _1 = require("./");
/**
 * Self instruction.
 */
var Self = /** @class */ (function (_super) {
    __extends(Self, _super);
    function Self(next) {
        var _this = _super.call(this, next) || this;
        _this.next = next;
        return _this;
    }
    Self.prototype.map = function (f) {
        return new Self(function_1.compose(this.next, f));
    };
    Self.prototype.exec = function (ctx) {
        return future_1.pure(this.next(ctx.module.self()));
    };
    return Self;
}(_1.Action));
exports.Self = Self;
/**
 * self provides the address of the module.
 */
exports.self = function () {
    return free_1.liftF(new Self(function_1.identity));
};
//# sourceMappingURL=self.js.map