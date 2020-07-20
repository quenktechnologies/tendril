"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doAction = exports.Api = exports.Context = void 0;
var function_1 = require("@quenk/noni/lib/data/function");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var monad_1 = require("@quenk/noni/lib/control/monad");
/**
 * Context represents the context of the http request.
 *
 * This is an internal API not directly exposed to request handlers. It
 * stores lower level APIs used to execute the work of the higher level Api
 * objects.
 */
var Context = /** @class */ (function () {
    function Context(module, request, response, onError, filters, prs) {
        if (prs === void 0) { prs = {}; }
        this.module = module;
        this.request = request;
        this.response = response;
        this.onError = onError;
        this.filters = filters;
        this.prs = prs;
    }
    /**
     * next provides the next Action to be interpreted.
     */
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
/**
 * Api represents an instruction to the tendril framework to carry out.
 *
 * An Api is usually an instruction to send a response to the requesting client
 * but are also used to interact with other APIs to do things like retrieve
 * a database connection from the connection pool for example.
 */
var Api = /** @class */ (function () {
    function Api(next) {
        this.next = next;
    }
    return Api;
}());
exports.Api = Api;
/**
 * doAction provides a do notation function specialized to Action
 * monads.
 *
 * Use this to chain Actions together using ES6's generator syntax.
 */
exports.doAction = function (f) { return monad_1.doN(f); };
//# sourceMappingURL=index.js.map