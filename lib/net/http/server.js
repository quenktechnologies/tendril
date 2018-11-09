"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var future_1 = require("@quenk/noni/lib/control/monad/future");
/**
 * Server wraps around an http server to provide stop and restart
 * facilities.
 *
 * This is necessary as node currently provides no way to stop a server
 * without waiting on clients.
 */
var Server = /** @class */ (function () {
    function Server(configuration) {
        this.configuration = configuration;
        this.sockets = [];
        this.handle = maybe_1.nothing();
        this.handler = function (_, __) { };
    }
    /**
     * listen for connections passing them to the provided handler.
     */
    Server.prototype.listen = function (handler) {
        var _this = this;
        if (this.handle instanceof maybe_1.Nothing) {
            this.handler = handler;
            this.handle = maybe_1.just(http.createServer(handler));
            return this
                .handle
                .map(function (h) { return future_1.fromCallback(function (cb) {
                h
                    .on('connection', function (s) {
                    _this.sockets.push(s);
                    s.on('close', function () { return _this.sockets =
                        _this.sockets.filter(function (sck) { return (s !== sck); }); });
                })
                    .on('listening', function () { return cb(undefined, _this); })
                    .listen(_this.configuration);
            }); })
                .get();
        }
        else {
            return future_1.raise(new Error('listen: Server is already listening'));
        }
    };
    /**
     * restart the Server.
     */
    Server.prototype.restart = function () {
        var _this = this;
        return this
            .stop()
            .chain(function () { return _this.listen(_this.handler); });
    };
    /**
     * stop the Server
     */
    Server.prototype.stop = function () {
        var _this = this;
        return this
            .flush()
            .chain(function (s) {
            return s
                .handle
                .map(close(s))
                .get();
        })
            .map(function () { _this.handle = maybe_1.nothing(); });
    };
    /**
     * flush all currently connected clients to the server.
     */
    Server.prototype.flush = function () {
        this.sockets.forEach(function (s) { return s.destroy(); });
        this.sockets = [];
        return future_1.pure(this);
    };
    return Server;
}());
exports.Server = Server;
var close = function (s) { return function (h) {
    return future_1.fromCallback(function (cb) { return h.close(function () { return cb(undefined, s); }); });
}; };
//# sourceMappingURL=server.js.map