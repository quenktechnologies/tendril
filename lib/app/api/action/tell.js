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
var _1 = require("./");
/**
 * Tell action.
 */
var Tell = /** @class */ (function (_super) {
    __extends(Tell, _super);
    function Tell(to, message, next) {
        var _this = _super.call(this, next) || this;
        _this.to = to;
        _this.message = message;
        _this.next = next;
        return _this;
    }
    Tell.prototype.map = function (f) {
        return new Tell(this.to, this.message, f(this.next));
    };
    Tell.prototype.exec = function (ctx) {
        var _this = this;
        return future_1.pure(ctx.module.tell(this.to, this.message))
            .map(function () { return _this.next; });
    };
    return Tell;
}(_1.Action));
exports.Tell = Tell;
/**
 * tell sends a message to another actor.
 */
exports.tell = function (to, m) {
    return free_1.liftF(new Tell(to, m, undefined));
};
//# sourceMappingURL=tell.js.map