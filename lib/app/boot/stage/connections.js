"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionsStage = void 0;
const record_1 = require("@quenk/noni/lib/data/record");
/**
 * ConnectionsStage opens all the connections configured for all the modules of
 * the Application.
 *
 * Connections are opened sequentially at the Application level but in parallel
 * at the module level. Currently if any fail, the whole boot process fails.
 * Issue #28 is tracking this.
 */
class ConnectionsStage {
    constructor(pool, modules, hooks) {
        this.pool = pool;
        this.modules = modules;
        this.hooks = hooks;
        this.name = 'connections';
    }
    execute() {
        let { modules, pool, hooks } = this;
        return (0, record_1.reduce)(modules, pool, (p, m) => {
            (0, record_1.map)(m.connections, (c, k) => p.add(k, c));
            return p;
        })
            .open()
            .chain(() => hooks.connected());
    }
}
exports.ConnectionsStage = ConnectionsStage;
//# sourceMappingURL=connections.js.map