"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var state_1 = require("@quenk/potoo/lib/actor/system/state");
/**
 * getModule provides a module given an address.
 */
exports.getModule = function (s, addr) {
    return state_1.get(s, addr).chain(function (c) { return c.module; });
};
//# sourceMappingURL=context.js.map