"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
var future_1 = require("@quenk/noni/lib/control/monad/future");
var function_1 = require("@quenk/noni/lib/data/function");
/**
 * Context represents the context of the http request.
 *
 * It provides an api that assists with filtering the request and response.
 */
var Context = /** @class */ (function () {
    function Context(module, request, response, onError, filters) {
        this.module = module;
        this.request = request;
        this.response = response;
        this.onError = onError;
        this.filters = filters;
    }
    Context.prototype.next = function () {
        return (this.filters.length > 0) ?
            future_1.pure(this.filters.shift()(this.request)) :
            future_1.raise(new Error(this.module.self() + ": No more filters!"));
    };
    /**
     * run processes the next filter or action in the chain.
     */
    Context.prototype.run = function () {
        var _this = this;
        this
            .next()
            .chain(function (n) { return n.foldM(function () { return future_1.pure(function_1.noop()); }, function (n) { return n.exec(_this); }); })
            .fork(this.onError, function () { });
    };
    return Context;
}());
exports.Context = Context;
//# sourceMappingURL=context.js.map