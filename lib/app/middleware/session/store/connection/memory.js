"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryConnection = void 0;
const session = require("express-session");
const future_1 = require("@quenk/noni/lib/control/monad/future");
/**
 * MemoryConnection provides a SessionStoreConnection wrapper for the
 * express-session#MemoryStore object.
 *
 * Note: This should only be used during development.
 */
class MemoryConnection {
    open() {
        return (0, future_1.pure)(undefined);
    }
    checkout() {
        console.warn('[MemoryStoreProvider]: Should not be used in production!');
        return (0, future_1.pure)(new session.MemoryStore());
    }
    close() {
        return (0, future_1.pure)(undefined);
    }
}
exports.MemoryConnection = MemoryConnection;
//# sourceMappingURL=memory.js.map