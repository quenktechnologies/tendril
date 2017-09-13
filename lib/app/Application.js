"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var express = require("express");
var server_1 = require("../server");
var defaults = {
    port: 2407,
    host: '0.0.0.0'
};
/**
 * Application is the main class of the framework.
 */
var Application = (function () {
    function Application(main) {
        this.main = main;
        this.express = express();
        process.on('unhandledRejection', function (e) { return main.onError(e); });
        process.on('uncaughtException', function (e) { return main.onError(e); });
    }
    Application.prototype.start = function () {
        var _this = this;
        return this.main.init(this)
            .then(function () {
            var opts = Object.assign({}, defaults, _this.main.getConf().tendril.server);
            _this.server = new server_1.ManagedServer(opts.port, opts.host, http.createServer(_this.main.getExpressApp()));
            return _this.server.start();
        })
            .then(function () { return _this; });
    };
    Application.prototype.stop = function () {
        var _this = this;
        return this.server.shutdown().then(function () { return _this; });
    };
    return Application;
}());
exports.Application = Application;
//# sourceMappingURL=Application.js.map