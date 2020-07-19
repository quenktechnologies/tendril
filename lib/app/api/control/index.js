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
exports.__esModule = true;
exports.fork = exports.value = exports.next = exports.Next = exports.Fork = exports.Value = void 0;
var free_1 = require("@quenk/noni/lib/control/monad/free");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var function_1 = require("@quenk/noni/lib/data/function");
var __1 = require("../");
/**
 * Value
 * @private
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
}(__1.Api));
exports.Value = Value;
/**
 * Fork
 * @private
 */
var Fork = /** @class */ (function (_super) {
    __extends(Fork, _super);
    function Fork(f, next) {
        var _this = _super.call(this, next) || this;
        _this.f = f;
        _this.next = next;
        return _this;
    }
    Fork.prototype.map = function (f) {
        return new Fork(this.f, function_1.compose(this.next, f));
    };
    Fork.prototype.exec = function (_) {
        var _a = this, f = _a.f, next = _a.next;
        var fut = (typeof f === 'function') ? f() : f;
        return fut.map(next);
    };
    return Fork;
}(__1.Api));
exports.Fork = Fork;
/**
 * Next
 * @private
 */
var Next = /** @class */ (function (_super) {
    __extends(Next, _super);
    function Next(request, next) {
        var _this = _super.call(this, next) || this;
        _this.request = request;
        _this.next = next;
        return _this;
    }
    Next.prototype.map = function (f) {
        return new Next(this.request, f(this.next));
    };
    Next.prototype.exec = function (ctx) {
        ctx.request = this.request;
        return ctx.next();
    };
    return Next;
}(__1.Api));
exports.Next = Next;
/**
 * next gives the go ahead to interpret the
 * actions of the next Filter chain.
 *
 * This action allows the Request in the context to be modified and
 * short-circuits the current chain.
 */
exports.next = function (r) {
    return free_1.liftF(new Next(r, undefined));
};
/**
 * value wraps a value so that it is available to the next value in the
 * chain.
 */
exports.value = function (value) {
    return free_1.liftF(new Value(value, function_1.identity));
};
/**
 * fork suspends execution for a Future to execute and provide a value.
 */
exports.fork = function (f) {
    return free_1.liftF(new Fork(f, function_1.identity));
};
