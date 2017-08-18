"use strict";
exports.__esModule = true;
var Reader = (function () {
    function Reader(f) {
        this.f = f;
    }
    Reader.prototype.chain = function (f) {
        var _this = this;
        return new Reader(function (c) { return f(_this.run(c)).run(c); });
    };
    Reader.prototype.run = function (c) {
        return this.f(c);
    };
    return Reader;
}());
exports.Reader = Reader;
