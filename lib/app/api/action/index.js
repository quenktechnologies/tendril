"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
/**
 * Action represents the result of a client request.
 *
 * It is implemented as a Functor DSL meant to be interpreted
 * later in a Free monad.
 */
var Action = /** @class */ (function () {
    function Action(next) {
        this.next = next;
    }
    return Action;
}());
exports.Action = Action;
//# sourceMappingURL=index.js.map