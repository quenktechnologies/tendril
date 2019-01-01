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
var future_1 = require("@quenk/noni/lib/control/monad/future");
var resident_1 = require("@quenk/potoo/lib/actor/resident");
var route_1 = require("../op/route");
var disable_1 = require("../op/disable");
var enable_1 = require("../op/enable");
var redirect_1 = require("../op/redirect");
var show_1 = require("../api/action/show");
/**
 * Disable a Module.
 *
 * All requests to the Module will 404.
 */
var Disable = /** @class */ (function () {
    function Disable() {
    }
    return Disable;
}());
exports.Disable = Disable;
/**
 * Enable a Module.
 */
var Enable = /** @class */ (function () {
    function Enable() {
    }
    return Enable;
}());
exports.Enable = Enable;
/**
 * Redirect requests to the module to another location.
 */
var Redirect = /** @class */ (function () {
    function Redirect(status, location) {
        this.status = status;
        this.location = location;
    }
    return Redirect;
}());
exports.Redirect = Redirect;
/**
 * Module of the application.
 *
 * A tendril application breaks up it's routes and related code
 * into a series of modules. Each module is an actor with the
 * ability to send and receive messages.
 *
 * Most actions of a Module are implemented using Op classes that
 * are executed by the App.
 *
 * This makes debugging slightly easier as we can review to some extent what
 * individual modules are doing via the op log.
 */
var Module = /** @class */ (function (_super) {
    __extends(Module, _super);
    function Module(system) {
        var _this = _super.call(this, system) || this;
        _this.system = system;
        _this.receive = behave(_this);
        return _this;
    }
    /**
     * install a route into the module's routing table.
     *
     * This is done as sys op to provide transparency.
     */
    Module.prototype.install = function (method, path, filters) {
        this.system.exec(new route_1.Route(this.self(), method, path, filters));
    };
    /**
     * show constructrs a Filter for displaying a view.
     */
    Module.prototype.show = function (name, ctx) {
        return function () { return future_1.pure(show_1.show(name, ctx)); };
    };
    Module.prototype.run = function () { };
    return Module;
}(resident_1.Immutable));
exports.Module = Module;
var behave = function (m) { return [
    new resident_1.Case(Disable, disable(m)),
    new resident_1.Case(Enable, enable(m)),
    new resident_1.Case(Redirect, redirect(m))
]; };
var disable = function (m) { return function (_) {
    return m.system.exec(new disable_1.Disable(m));
}; };
var enable = function (m) { return function (_) {
    return m.system.exec(new enable_1.Enable(m));
}; };
var redirect = function (m) { return function (_a) {
    var status = _a.status, location = _a.location;
    return m.system.exec(new redirect_1.Redirect(m, status, location));
}; };
//# sourceMappingURL=index.js.map