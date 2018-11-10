"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var log = require("@quenk/potoo/lib/actor/system/log");
var codes = require("./");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var op_1 = require("@quenk/potoo/lib/actor/system/op");
var context_1 = require("../state/context");
/**
 * Enable instruction.
 *
 * Removes the disable flag and redirecting from a module.
 */
var Enable = /** @class */ (function (_super) {
    __extends(Enable, _super);
    function Enable(module) {
        var _this = _super.call(this) || this;
        _this.module = module;
        _this.level = log.WARN;
        _this.code = codes.OP_ENABLE;
        return _this;
    }
    Enable.prototype.exec = function (app) {
        var _this = this;
        return context_1.getModule(app.state, this.module.self())
            .map(function (m) { m.disabled = false; m.redirect = maybe_1.nothing(); })
            .orJust(function () { return console.warn(_this.module.self() + ": Cannot be enabled!"); })
            .get();
    };
    return Enable;
}(op_1.Op));
exports.Enable = Enable;
//# sourceMappingURL=enable.js.map