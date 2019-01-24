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
var function_1 = require("@quenk/noni/lib/data/function");
var _1 = require("./");
/**
 * Await action.
 */
var Await = /** @class */ (function (_super) {
    __extends(Await, _super);
    function Await(f, next) {
        var _this = _super.call(this, next) || this;
        _this.f = f;
        _this.next = next;
        return _this;
    }
    Await.prototype.map = function (f) {
        return new Await(this.f, function_1.compose(this.next, f));
    };
    Await.prototype.exec = function (_) {
        return this.f().map(this.next);
    };
    return Await;
}(_1.Action));
exports.Await = Await;
/**
 * await a value from an asynchrounous operation before continuing.
 */
exports.await = function (f) {
    return free_1.liftF(new Await(f, function_1.identity));
};
//# sourceMappingURL=await.js.map