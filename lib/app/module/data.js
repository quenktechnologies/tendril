"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var maybe_1 = require("@quenk/noni/lib/data/maybe");
/**
 * getModule provides a module given an address.
 */
exports.getModule = function (data, addr) {
    return maybe_1.fromNullable(data[addr]);
};
//# sourceMappingURL=data.js.map