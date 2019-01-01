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
var status = require("../status");
var free_1 = require("@quenk/noni/lib/control/monad/free");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var _1 = require("./");
/**
 * NoContent response.
 */
var NoContent = /** @class */ (function (_super) {
    __extends(NoContent, _super);
    function NoContent(next) {
        var _this = _super.call(this, maybe_1.nothing(), next) || this;
        _this.next = next;
        _this.status = status.NO_CONTENT;
        return _this;
    }
    NoContent.prototype.map = function (f) {
        return new NoContent(f(this.next));
    };
    return NoContent;
}(_1.Response));
exports.NoContent = NoContent;
/**
 * noContent sends the "NO CONTENT" status to the client.
 */
exports.noContent = function () {
    return free_1.liftF(new NoContent(undefined));
};
//# sourceMappingURL=no-content.js.map