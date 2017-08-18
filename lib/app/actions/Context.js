"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Context represents the context of the http request.
 *
 * It provides an api that assits with filtering the request and response.
 */
var Context = (function () {
    function Context(request, response, filters, handler, module) {
        this.request = request;
        this.response = response;
        this.filters = filters;
        this.handler = handler;
        this.module = module;
    }
    /**
     * next processes the next filter or action in the chain.
     */
    Context.prototype.next = function () {
        return (this.filters.length > 0) ?
            this.filters.shift()(this.request).run(this) :
            this.handler(this.request).run(this);
    };
    return Context;
}());
exports.Context = Context;
//# sourceMappingURL=Context.js.map