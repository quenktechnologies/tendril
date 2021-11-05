"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomSecret = exports.CookieParserStage = exports.WARN_NO_SECRET = void 0;
const parser = require("cookie-parser");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const record_1 = require("@quenk/noni/lib/data/record");
exports.WARN_NO_SECRET = '[CookieParser]: Warning! No app.parser.cookie.secret configured! \
A random string will be generated and used however this means user sessions\
will not be valid if the application restarts!';
/**
 * CookieParserStage configures middleware for parsing cookies.
 */
class CookieParserStage {
    constructor(modules) {
        this.modules = modules;
        this.name = 'cookie-parser';
    }
    execute() {
        let { modules } = this;
        return (0, future_1.fromCallback)(cb => {
            (0, record_1.map)(modules, m => {
                if (m.template &&
                    m.template.app &&
                    m.template.app.parsers &&
                    m.template.app.parsers.cookie &&
                    m.template.app.parsers.cookie.enable) {
                    let { cookie } = m.template.app.parsers;
                    let secret = cookie.secret ||
                        process.env.COOKIE_SECRET ||
                        process.env.SECRET ||
                        exports.randomSecret;
                    if (secret === exports.randomSecret)
                        console.warn(exports.WARN_NO_SECRET);
                    m.app.use(parser(secret, cookie.options));
                }
            });
            cb(null);
        });
    }
}
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
//# sourceMappingURL=cookie-parser.js.map