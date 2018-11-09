"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var state_1 = require("@quenk/potoo/lib/actor/system/state");
/**
 * getModule provides a module given an address.
 */
exports.getModule = function (s, addr) {
    return state_1.get(s, addr).chain(function (c) { return c.module; });
};
/**
 * newContext produces a new plain context.
 */
exports.newContext = function (module, actor, template) { return ({
    module: module,
    mailbox: maybe_1.nothing(),
    actor: actor,
    behaviour: [],
    flags: { immutable: true, buffered: true },
    template: template
}); };
//# sourceMappingURL=context.js.map