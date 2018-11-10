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
 * Redirect instruction.
 *
 * Forces a module to redirect all requests to a new location.
 */
var Redirect = /** @class */ (function (_super) {
    __extends(Redirect, _super);
    function Redirect(module, status, location) {
        var _this = _super.call(this) || this;
        _this.module = module;
        _this.status = status;
        _this.location = location;
        _this.level = log.WARN;
        _this.code = codes.OP_REDIRECT;
        return _this;
    }
    Redirect.prototype.exec = function (app) {
        var _this = this;
        var _a = this, location = _a.location, status = _a.status;
        return context_1.getModule(app.state, this.module.self())
            .map(function (m) { m.redirect = maybe_1.just({ location: location, status: status }); })
            .orJust(function () { return console.warn(_this.module.self() + ": Cannot be enabled!"); })
            .get();
    };
    return Redirect;
}(op_1.Op));
exports.Redirect = Redirect;
//# sourceMappingURL=redirect.js.map