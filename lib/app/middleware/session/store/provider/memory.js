"use strict";
exports.__esModule = true;
exports.MemoryStoreProvider = void 0;
var session = require("express-session");
var future_1 = require("@quenk/noni/lib/control/monad/future");
/**
 * MemoryStoreProvider provides the express-session#MemoryStore Store.
 *
 * Note: This should only be used during development.
 */
var MemoryStoreProvider = /** @class */ (function () {
    function MemoryStoreProvider() {
    }
    MemoryStoreProvider.prototype.create = function () {
        console.warn('[MemoryStoreProvider]: Should not be used in production!');
        return future_1.pure(new session.MemoryStore());
    };
    return MemoryStoreProvider;
}());
exports.MemoryStoreProvider = MemoryStoreProvider;
