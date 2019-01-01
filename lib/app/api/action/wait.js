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
 * Wait action.
 */
var Wait = /** @class */ (function (_super) {
    __extends(Wait, _super);
    function Wait(f, next) {
        var _this = _super.call(this, next) || this;
        _this.f = f;
        _this.next = next;
        return _this;
    }
    Wait.prototype.map = function (f) {
        return new Wait(this.f, f(this.next));
    };
    Wait.prototype.exec = function (ctx) {
        var _this = this;
        return this.f.chain(function (n) {
            return n.foldM(function () { return future_1.pure(function_1.noop()); }, function (n) { return n.exec(ctx); });
        })
            .chain(function () { return future_1.pure(_this.next); });
    };
    return Wait;
}(_1.Action));
exports.Wait = Wait;
/**
 * wait on an asynchrounous operation to acquire the next
 * action to carry out.
 */
exports.wait = function (f) {
    return free_1.liftF(new Wait(f, undefined));
};
//# sourceMappingURL=wait.js.map