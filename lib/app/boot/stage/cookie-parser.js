"use strict";
exports.__esModule = true;
exports.randomSecret = exports.CookieParserStage = exports.WARN_NO_SECRET = void 0;
var parser = require("cookie-parser");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var record_1 = require("@quenk/noni/lib/data/record");
exports.WARN_NO_SECRET = '[CookieParser]: Warning! No app.parser.cookie.secret configured! \
A random string will be generated and used however this means user sessions\
will not be valid if the application restarts!';
/**
 * CookieParserStage configures middleware for parsing cookies.
 */
var CookieParserStage = /** @class */ (function () {
    function CookieParserStage(modules) {
        this.modules = modules;
        this.name = 'cookie-parser';
    }
    CookieParserStage.prototype.execute = function () {
        var modules = this.modules;
        record_1.map(modules, function (m) {
            if (m.template &&
                m.template.app &&
                m.template.app.parser &&
                m.template.app.parser.cookie &&
                m.template.app.parser.cookie.enable) {
                var cookie = m.template.app.parser.cookie;
                var secret = cookie.secret ||
                    process.env.COOKIE_SECRET ||
                    process.env.SECRET ||
                    exports.randomSecret;
                if (secret === exports.randomSecret)
                    console.warn(exports.WARN_NO_SECRET);
                m.app.use(parser(secret, cookie.options));
            }
        });
        return future_1.pure(undefined);
    };
    return CookieParserStage;
}());
exports.CookieParserStage = CookieParserStage;
/**
 * @private
 */
exports.randomSecret = (Math
    .random()
    .toString(36)
    .substring(2, 15)) +
    (Math
        .random()
        .toString(36)
        .substring(2, 15));
