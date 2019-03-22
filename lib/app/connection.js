"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var future_1 = require("@quenk/noni/lib/control/monad/future");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var function_1 = require("@quenk/noni/lib/data/function");
var record_1 = require("@quenk/noni/lib/data/record");
/**
 * Pool provides a simple storage medium for persistent
 * remote resources used in an application.
 *
 * These resources may be databases, other http servers or
 * some low level resource the application uses.
 *
 * The Pool class itself does not actually implement connection
 * pooling, instead the implementation of such is left up to
 * the implementors of the Connection interface.
 *
 * What this class really provides is a way to open and close
 * a group of connections at once, as well as retrieve
 * indivdiual ones when needed.
 *
 * TODO: In the future we may add a way for connections to be re-established,
 * lazily started and more. This would be subject to whether we decide to make
 * connections actors or not.
 */
var Pool = /** @class */ (function () {
    function Pool(store) {
        this.store = store;
    }
    /**
     * add a new Conneciton to the pool.
     */
    Pool.prototype.add = function (key, conn) {
        this.store[key] = conn;
        return this;
    };
    /**
     * get a Connection from the pool.
     **/
    Pool.prototype.get = function (key) {
        return maybe_1.fromNullable(this.store[key]);
    };
    /**
     * open all the connections in the pool.
     */
    Pool.prototype.open = function () {
        return future_1.parallel(record_1.values(record_1.map(this.store, function (c) { return c.open(); }))).map(function_1.noop);
    };
    /**
     * close all the connections in the pool.
     */
    Pool.prototype.close = function () {
        var _this = this;
        return future_1.parallel(record_1.values(record_1.map(this.store, function (c) { return c.close(); }))).map(function () { _this.store = {}; });
    };
    return Pool;
}());
exports.Pool = Pool;
// store connections in one place.
var pool = new Pool({});
/**
 * getInstance provides the singleton instance of the connection pool.
 */
exports.getInstance = function () { return pool; };
//# sourceMappingURL=connection.js.map