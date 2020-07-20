"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionsStage = void 0;
var record_1 = require("@quenk/noni/lib/data/record");
/**
 * ConnectionsStage opens all the connections configured for all the modules of
 * the Application.
 *
 * Connections are opened sequentially at the Application level but in parallel
 * at the module level. Currently if any fail, the whole boot process fails.
 * Issue #28 is tracking this.
 */
var ConnectionsStage = /** @class */ (function () {
    function ConnectionsStage(pool, modules, hooks) {
        this.pool = pool;
        this.modules = modules;
        this.hooks = hooks;
        this.name = 'connections';
    }
    ConnectionsStage.prototype.execute = function () {
        var _a = this, modules = _a.modules, pool = _a.pool, hooks = _a.hooks;
        return record_1.reduce(modules, pool, function (p, m) {
            record_1.map(m.connections, function (c, k) { return p.add(k, c); });
            return p;
        })
            .open()
            .chain(function () { return hooks.connected(); });
    };
    return ConnectionsStage;
}());
exports.ConnectionsStage = ConnectionsStage;
//# sourceMappingURL=connections.js.map