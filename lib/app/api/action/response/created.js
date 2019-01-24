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
 * Created response.
 */
var Created = /** @class */ (function (_super) {
    __extends(Created, _super);
    function Created() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.status = status.CREATED;
        return _this;
    }
    Created.prototype.map = function (f) {
        return new Created(this.body, f(this.next));
    };
    return Created;
}(_1.Response));
exports.Created = Created;
/**
 * created sends the "CREATED" status to the client with optional body.
 */
exports.created = function (body) {
    return free_1.liftF(new Created(maybe_1.fromNullable(body), undefined));
};
//# sourceMappingURL=created.js.map