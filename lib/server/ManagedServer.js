"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Bluebird = require("bluebird");
/**
 * ManagedServer wraps around a Server to add additional features.
 *
 * By wrapping around the server implementation, we gain the ability
 * to shutdown and restart the server when needed. Each time
 * the server is stopped, we destroy all existing socket sockets
 * so node does not wait on them to end before calling the close() callback.
 */
var ManagedServer = (function () {
    function ManagedServer(port, host, server) {
        this.port = port;
        this.host = host;
        this.server = server;
        this.sockets = [];
    }
    ManagedServer.prototype.store = function (socket) {
        var _this = this;
        this.sockets.push(socket);
        socket.on('close', function () { return _this.sockets.filter(function (s) { return !(s === socket); }); });
    };
    ManagedServer.prototype.flush = function () {
        this.sockets.forEach(function (s) { return s.destroy(); });
    };
    ManagedServer.prototype.start = function () {
        var _this = this;
        return Bluebird.fromCallback(function (cb) {
            _this.server.on('connection', function (socket) { return _this.store(socket); });
            _this.server.on('listening', function () { return cb(null, _this); });
            _this.server.listen(_this.port, _this.host);
        });
    };
    ManagedServer.prototype.shutdown = function () {
        var _this = this;
        return Bluebird.fromCallback(function (cb) {
            _this.server.close(function () { return cb(null, _this); });
        }).
            then(function () { return _this.flush(); });
    };
    ManagedServer.prototype.restart = function () {
        var _this = this;
        return this.shutdown().then(function () { return _this.start(); });
    };
    return ManagedServer;
}());
exports.ManagedServer = ManagedServer;
//# sourceMappingURL=ManagedServer.js.map