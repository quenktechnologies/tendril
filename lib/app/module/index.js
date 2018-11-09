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
var resident_1 = require("@quenk/potoo/lib/actor/resident");
var Module = /** @class */ (function (_super) {
    __extends(Module, _super);
    function Module(system) {
        var _this = _super.call(this, system) || this;
        _this.system = system;
        _this.receive = [];
        return _this;
    }
    Module.prototype.run = function () { };
    return Module;
}(resident_1.Immutable));
exports.Module = Module;
//# sourceMappingURL=index.js.map