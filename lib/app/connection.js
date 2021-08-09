"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsafeGetUserConnection = exports.getUserConnection = exports.getInstance = exports.Pool = void 0;
const record_1 = require("@quenk/noni/lib/data/record");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const function_1 = require("@quenk/noni/lib/data/function");
/**
 * Pool provides a simple storage medium for persistent
 * remote resources used in an application.
 *
 * These resources may be databases, other http servers or
 * some low level resource the application uses.
 *
 * The Pool class itself does not actually implement connection
 * pooling, instead implementation is left up to the Connections.
 *
 * What this class really provides is a way to open and close
 * a group of connections at once, as well as retrieve
 * individual ones when needed. Tendril relies on this to cleanly shutdown.
 */
class Pool {
    constructor(conns) {
        this.conns = conns;
    }
    /**
     * add a new Connection to the pool.
     */
    add(key, conn) {
        this.conns[key] = conn;
        return this;
    }
    /**
     * get a Connection from the pool.
     **/
    get(key) {
        return maybe_1.fromNullable(this.conns[key]);
    }
    /**
     * open all the connections in the pool.
     */
    open() {
        return future_1.parallel(record_1.mapTo(this.conns, c => c.open())).map(function_1.noop);
    }
    /**
     * close all the connections in the pool.
     */
    close() {
        return future_1.parallel(record_1.mapTo(this.conns, c => c.close())).map(() => {
            this.conns = {};
        });
    }
}
exports.Pool = Pool;
// store connections in one place.
const pool = new Pool({});
/**
 * getInstance provides the singleton instance of the connection pool.
 */
const getInstance = () => pool;
exports.getInstance = getInstance;
/**
 * getUserConnection provides the underlying user connection by name if found.
 */
const getUserConnection = (name) => future_1.doFuture(function* () {
    let mConn = pool.get(name);
    if (mConn.isNothing())
        return future_1.pure(mConn);
    let conn = yield mConn.get().checkout();
    return future_1.pure(maybe_1.just(conn));
});
exports.getUserConnection = getUserConnection;
/**
 * unsafeGetUserConnection is like getUserConnection but assumes the connection
 * exists.
 *
 * If the the connection does not exist, the Future will raise an exception.
 */
const unsafeGetUserConnection = (name) => exports.getUserConnection(name).map(m => m.get());
exports.unsafeGetUserConnection = unsafeGetUserConnection;
//# sourceMappingURL=connection.js.map