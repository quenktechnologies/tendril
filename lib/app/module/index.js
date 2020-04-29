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
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var case_1 = require("@quenk/potoo/lib/actor/resident/case");
var resident_1 = require("@quenk/potoo/lib/actor/resident");
var data_1 = require("../module/data");
var context_1 = require("../api/context");
var response_1 = require("../api/action/response");
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
        _this.receive = [
            new case_1.Case(Disable, function () { return _this.disable(); }),
            new case_1.Case(Enable, function () { return _this.enable(); }),
            new case_1.Case(Redirect, function (r) { return _this.redirect(r.location, r.status); })
        ];
        /**
         * runInContext given a list of filters, produces an
         * express request handler where the action is the
         * interpretation of the filters.
         */
        _this.runInContext = function (filters) { return function (req, res, next) {
            new context_1.Context(_this, req, res, next, filters.slice()).run();
        }; };
        /**
         * runInContextWithError is used when an error occurs during request
         * handling.
         */
        _this.runInContextWithError = function (filter) {
            return function (err, req, res, next) {
                new context_1.Context(_this, req, res, next, [function (r) { return filter(err, r); }]).run();
            };
        };
        return _this;
    }
    /**
     * install routes into the routing table for this module.
     */
    Module.prototype.install = function (routes) {
        var _this = this;
        var maybeModule = data_1.getModule(this.system.modules, this.self());
        if (maybeModule.isJust()) {
            var m_1 = maybeModule.get();
            routes.forEach(function (_a) {
                var path = _a.path, method = _a.method, filters = _a.filters;
                m_1.app[method](path, _this.runInContext(filters));
            });
        }
    };
    Module.prototype.disable = function () {
        var _this = this;
        data_1.getModule(this.system.modules, this.self())
            .map(function (m) { m.disabled = true; })
            .orJust(function () { return console.warn(_this.self() + ": Cannot be disabled!"); })
            .get();
    };
    Module.prototype.enable = function () {
        var _this = this;
        data_1.getModule(this.system.modules, this.self())
            .map(function (m) { m.disabled = false; m.redirect = maybe_1.nothing(); })
            .orJust(function () { return console.warn(_this.self() + ": Cannot be enabled!"); })
            .get();
    };
    Module.prototype.redirect = function (location, status) {
        var _this = this;
        data_1.getModule(this.system.modules, this.self())
            .map(function (m) { m.redirect = maybe_1.just({ location: location, status: status }); })
            .orJust(function () { return console.warn(_this.self() + ": Cannot be enabled!"); })
            .get();
    };
    /**
     * show constructrs a Filter for displaying a view.
     */
    Module.prototype.show = function (name, ctx) {
        return function () { return response_1.show(name, ctx); };
    };
    Module.prototype.run = function () { };
    return Module;
}(resident_1.Immutable));
exports.Module = Module;
//# sourceMappingURL=index.js.map