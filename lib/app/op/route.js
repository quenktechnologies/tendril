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
var log = require("@quenk/potoo/lib/actor/system/log");
var codes = require("./");
var op_1 = require("@quenk/potoo/lib/actor/system/op");
var context_1 = require("../state/context");
var api_1 = require("../api");
/**
 * Route instructs the App to install a new route
 * for a module.
 */
var Route = /** @class */ (function (_super) {
    __extends(Route, _super);
    function Route(module, method, path, filters) {
        var _this = _super.call(this) || this;
        _this.module = module;
        _this.method = method;
        _this.path = path;
        _this.filters = filters;
        _this.code = codes.OP_ROUTE;
        _this.level = log.INFO;
        return _this;
    }
    Route.prototype.exec = function (app) {
        var _this = this;
        return context_1.getModule(app.state, this.module)
            .map(function (m) {
            switch (_this.method) {
                case 'get':
                    m.app.get(_this.path, dispatch(_this, m.module));
                    break;
                case 'post':
                    m.app.post(_this.path, dispatch(_this, m.module));
                    break;
                case 'put':
                    m.app.put(_this.path, dispatch(_this, m.module));
                    break;
                case 'patch':
                    m.app.patch(_this.path, dispatch(_this, m.module));
                    break;
                case 'delete':
                    m.app.delete(_this.path, dispatch(_this, m.module));
                    break;
            }
        })
            .get();
    };
    return Route;
}(op_1.Op));
exports.Route = Route;
var dispatch = function (r, m) {
    return function (req, res) {
        return new api_1.Context(m, req, res, r.filters.slice()).run();
    };
};
//# sourceMappingURL=route.js.map