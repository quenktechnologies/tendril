"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToken = exports.GetToken = void 0;
const free_1 = require("@quenk/noni/lib/control/monad/free");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const function_1 = require("@quenk/noni/lib/data/function");
const _1 = require("./");
/**
 * GetToken
 * @private
 */
class GetToken extends _1.Api {
    constructor(next) {
        super(next);
        this.next = next;
    }
    map(f) {
        return new GetToken(function_1.compose(this.next, f));
    }
    exec({ request }) {
        let token = request.csrfToken();
        return future_1.pure(this.next(token));
    }
}
exports.GetToken = GetToken;
/**
 * getToken provides the current CSRF token.
 */
exports.getToken = () => free_1.liftF(new GetToken(function_1.identity));
//# sourceMappingURL=csrf.js.map