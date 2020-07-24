"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStoreProvider = void 0;
const session = require("express-session");
const future_1 = require("@quenk/noni/lib/control/monad/future");
/**
 * MemoryStoreProvider provides the express-session#MemoryStore Store.
 *
 * Note: This should only be used during development.
 */
class MemoryStoreProvider {
    create() {
        console.warn('[MemoryStoreProvider]: Should not be used in production!');
        return future_1.pure(new session.MemoryStore());
    }
}
exports.MemoryStoreProvider = MemoryStoreProvider;
//# sourceMappingURL=memory.js.map