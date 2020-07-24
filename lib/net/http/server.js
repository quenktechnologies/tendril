"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const http = require("http");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const future_1 = require("@quenk/noni/lib/control/monad/future");
/**
 * Server wraps around an http server to provide stop and restart
 * facilities.
 *
 * This is necessary as node currently provides no way to stop a server
 * without waiting on clients.
 */
class Server {
    constructor(configuration) {
        this.configuration = configuration;
        this.sockets = [];
        this.handle = maybe_1.nothing();
        this.handler = (_, __) => { };
    }
    /**
     * listen for connections passing them to the provided handler.
     */
    listen(handler) {
        if (this.handle instanceof maybe_1.Nothing) {
            this.handler = handler;
            this.handle = maybe_1.just(http.createServer(handler));
            return this
                .handle
                .map(h => future_1.fromCallback(cb => {
                h
                    .on('connection', s => {
                    this.sockets.push(s);
                    s.on('close', () => this.sockets =
                        this.sockets.filter(sck => (s !== sck)));
                })
                    .on('listening', () => cb(undefined, this))
                    .listen(this.configuration);
            }))
                .get();
        }
        else {
            return future_1.raise(new Error('listen: Server is already listening'));
        }
    }
    /**
     * restart the Server.
     */
    restart() {
        return this
            .stop()
            .chain(() => this.listen(this.handler));
    }
    /**
     * stop the Server
     */
    stop() {
        return this
            .flush()
            .chain(s => s
            .handle
            .map(close(s))
            .orJust(() => future_1.pure(s))
            .get())
            .map(() => { this.handle = maybe_1.nothing(); });
    }
    /**
     * flush all currently connected clients to the server.
     */
    flush() {
        this.sockets.forEach(s => s.destroy());
        this.sockets = [];
        return future_1.pure(this);
    }
}
exports.Server = Server;
const close = (s) => (h) => future_1.fromCallback(cb => h.close(() => cb(undefined, s)));
//# sourceMappingURL=server.js.map