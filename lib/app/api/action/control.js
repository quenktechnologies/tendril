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
 * Value action.
 */
var Value = /** @class */ (function (_super) {
    __extends(Value, _super);
    function Value(value, next) {
        var _this = _super.call(this, next) || this;
        _this.value = value;
        _this.next = next;
        return _this;
    }
    Value.prototype.map = function (f) {
        return new Value(this.value, function_1.compose(this.next, f));
    };
    Value.prototype.exec = function (_) {
        return future_1.pure(this.next(this.value));
    };
    return Value;
}(_1.Action));
exports.Value = Value;
/**
 * value wraps a value so that it is available to the next value in the
 * chain.
 */
exports.value = function (value) {
    return free_1.liftF(new Value(value, function_1.identity));
};
//# sourceMappingURL=control.js.map