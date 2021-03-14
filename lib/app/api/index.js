"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doAction = exports.Api = exports.Context = void 0;
const free_1 = require("@quenk/noni/lib/control/monad/free");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const monad_1 = require("@quenk/noni/lib/control/monad");
/**
 * Context represents the context of the http request.
 *
 * This is an internal API not directly exposed to request handlers. It
 * stores lower level APIs used to execute the work of the higher level [[Api]]
 * objects.
 */
class Context {
    constructor(module, request, response, onError, filters) {
        this.module = module;
        this.request = request;
        this.response = response;
        this.onError = onError;
        this.filters = filters;
    }
    /**
     * abort the processing of filters for this Context.
     */
    abort() {
        this.filters = [];
        return future_1.pure(free_1.pure(undefined));
    }
    /**
     * next provides the next Action to be interpreted.
     */
    next() {
        return (this.filters.length > 0) ?
            future_1.pure(this.filters.shift()(this.request)) :
            future_1.raise(new Error(`${this.module.self()}: No more filters!`));
    }
    /**
     * run processes the next filter or action in the chain.
     */
    run() {
        this
            .next()
            .chain(n => n.foldM(() => future_1.pure(undefined), n => n.exec(this)))
            .fork(this.onError, () => { });
    }
}
exports.Context = Context;
/**
 * Api represents an instruction to the tendril framework to carry out.
 *
 * An Api is usually an instruction to send a response to the requesting client
 * but are also used to interact with other APIs to do things like retrieve
 * a database connection from the connection pool for example.
 */
class Api {
    constructor(next) {
        this.next = next;
    }
}
exports.Api = Api;
/**
 * doAction provides a do notation function specialized to Action
 * monads.
 *
 * Use this to chain Actions together using ES6's generator syntax.
 */
const doAction = (f) => monad_1.doN(f);
exports.doAction = doAction;
//# sourceMappingURL=index.js.map