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
var _1 = require("./");
/**
 * Next action.
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
}(_1.Action));
exports.Next = Next;
/**
 * next gives the go ahead to interpret the
 * actions of the next Filter chain.
 *
 * This action allows the Request in the context to be modified and
 * short-circuits the current chain.
 */
exports.next = function (r) { return free_1.liftF(new Next(r, undefined)); };
//# sourceMappingURL=next.js.map