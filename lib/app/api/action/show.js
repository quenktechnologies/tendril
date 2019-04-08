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
var headers = require("../../../net/http/headers");
var free_1 = require("@quenk/noni/lib/control/monad/free");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var context_1 = require("../../state/context");
var _1 = require("./");
/**
 * Show action.
 */
var Show = /** @class */ (function (_super) {
    __extends(Show, _super);
    function Show(view, context, next) {
        var _this = _super.call(this, next) || this;
        _this.view = view;
        _this.context = context;
        _this.next = next;
        return _this;
    }
    Show.prototype.map = function (f) {
        return new Show(this.view, this.context, f(this.next));
    };
    Show.prototype.exec = function (_a) {
        var _this = this;
        var response = _a.response, module = _a.module;
        return context_1.getModule(module.system.state, module.self())
            .chain(function (m) { return m.show; })
            .map(function (f) {
            return f(_this.view, _this.context.orJust(function () { return ({}); }).get())
                .chain(function (c) {
                response.set(headers.CONTENT_TYPE, c.type);
                response.write(c.content);
                response.end();
                return future_1.pure(_this.next);
            });
        })
            .orJust(function () { return future_1.raise(new Error(module.self() + ": " +
            "No view engine configured!")); })
            .get();
    };
    return Show;
}(_1.Action));
exports.Show = Show;
/**
 * show the client some content.
 */
exports.show = function (view, context) {
    return free_1.liftF(new Show(view, maybe_1.fromNullable(context), undefined));
};
//# sourceMappingURL=show.js.map