"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSRFTokenStage = exports.ERROR_TOKEN_INVALID = exports.DEFAULT_SEND_COOKIE_NAME = void 0;
var csurf = require("csurf");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var record_1 = require("@quenk/noni/lib/data/record");
exports.DEFAULT_SEND_COOKIE_NAME = 'xsrf-token';
exports.ERROR_TOKEN_INVALID = 'EBADCSRFTOKEN';
var defaultOptions = {
    send_cookie: false,
    send_cookie_name: exports.DEFAULT_SEND_COOKIE_NAME,
    options: {}
};
var readMethods = ['GET', 'HEAD', 'OPTIONS'];
/**
 * CSRFTokenStage configures middleware to help protect against CSRF attacks.
 *
 * This requires app.session.enable to be set to true.
 */
var CSRFTokenStage = /** @class */ (function () {
    function CSRFTokenStage(modules) {
        this.modules = modules;
        this.name = 'csrf-token';
    }
    CSRFTokenStage.prototype.execute = function () {
        var modules = this.modules;
        record_1.map(modules, function (m) {
            if (m.template &&
                m.template.app &&
                m.template.app.csrf &&
                m.template.app.csrf.token &&
                m.template.app.csrf.token.enable) {
                var conf_1 = record_1.merge(defaultOptions, m.template.app.csrf.token);
                m.app.use(csurf(conf_1.options));
                if (conf_1.send_cookie) {
                    m.app.all('*', function (req, res, next) {
                        if (readMethods.indexOf(req.method) > -1)
                            res.cookie(conf_1.send_cookie_name, req.csrfToken());
                        next();
                    });
                }
                if (conf_1.on && conf_1.on.failure) {
                    var filters_1 = [conf_1.on.failure];
                    //XXX:The casts to Type are used here because @types/express
                    //has gone wacky. I don't have time for these shenanigans.
                    //See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/40138
                    var handler = function (err, req, res, next) {
                        if (err.code !== exports.ERROR_TOKEN_INVALID)
                            return next();
                        m.module.runInContext(filters_1)(req, res, next);
                    };
                    m.app.use(handler);
                }
            }
        });
        return future_1.pure(undefined);
    };
    return CSRFTokenStage;
}());
exports.CSRFTokenStage = CSRFTokenStage;
//# sourceMappingURL=csrf-token.js.map