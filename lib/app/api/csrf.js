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
        return new GetToken((0, function_1.compose)(this.next, f));
    }
    exec({ request }) {
        let token = request.toExpress().csrfToken();
        return (0, future_1.pure)(this.next(token));
    }
}
exports.GetToken = GetToken;
/**
 * getToken provides the current CSRF token.
 */
const getToken = () => (0, free_1.liftF)(new GetToken(function_1.identity));
exports.getToken = getToken;
//# sourceMappingURL=csrf.js.map