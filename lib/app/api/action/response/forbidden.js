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
var status = require("./status");
var free_1 = require("@quenk/noni/lib/control/monad/free");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var _1 = require("./");
/**
 * Forbiddden response.
 */
var Forbidden = /** @class */ (function (_super) {
    __extends(Forbidden, _super);
    function Forbidden() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = status.FORBIDDEN;
        return _this;
    }
    Forbidden.prototype.map = function (f) {
        return new Forbidden(this.body, f(this.next));
    };
    return Forbidden;
}(_1.Response));
exports.Forbidden = Forbidden;
/**
 * forbidden sends the "FORBIDDEN" status to the client with optional body.
 */
exports.forbidden = function (body) {
    return free_1.liftF(new Forbidden(maybe_1.fromNullable(body), undefined));
};
//# sourceMappingURL=forbidden.js.map