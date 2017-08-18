"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Bluebird = require("bluebird");
/**
 * Connections is an unsafe (volatile) store for data connections
 */
var Connections = (function () {
    function Connections() {
        this.store = {};
    }
    Connections.prototype.add = function (key, conn) {
        if (this.store[key] != null)
            return Bluebird.reject(new Error("A connection already exists named '" + key + "'!"));
        this.store[key] = conn;
        return Bluebird.resolve(this);
    };
    /**
     * get a unwraped pool member.
     */
    Connections.prototype.get = function (key) {
        if (this.store[key])
            return this.store[key].unwrap();
        return Bluebird.reject(new Error("Connection '" + key + "', does not exist!"));
    };
    return Connections;
}());
exports.Connections = Connections;
exports.Pool = new Connections();
//# sourceMappingURL=Connections.js.map