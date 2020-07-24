"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstance = exports.Pool = void 0;
const future_1 = require("@quenk/noni/lib/control/monad/future");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const function_1 = require("@quenk/noni/lib/data/function");
const record_1 = require("@quenk/noni/lib/data/record");
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
class Pool {
    constructor(store) {
        this.store = store;
    }
    /**
     * add a new Conneciton to the pool.
     */
    add(key, conn) {
        this.store[key] = conn;
        return this;
    }
    /**
     * get a Connection from the pool.
     **/
    get(key) {
        return maybe_1.fromNullable(this.store[key]);
    }
    /**
     * open all the connections in the pool.
     */
    open() {
        return future_1.parallel(record_1.values(record_1.map(this.store, (c) => c.open()))).map(function_1.noop);
    }
    /**
     * close all the connections in the pool.
     */
    close() {
        return future_1.parallel(record_1.values(record_1.map(this.store, c => c.close()))).map(() => { this.store = {}; });
    }
}
exports.Pool = Pool;
// store connections in one place.
const pool = new Pool({});
/**
 * getInstance provides the singleton instance of the connection pool.
 */
exports.getInstance = () => pool;
//# sourceMappingURL=connection.js.map