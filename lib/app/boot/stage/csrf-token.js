"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSRFTokenStage = exports.PRS_VIEW_CSRF_TOKEN = exports.PRS_CSRF_TOKEN = exports.ERROR_TOKEN_INVALID = exports.DEFAULT_SEND_COOKIE_NAME = void 0;
const csurf = require("csurf");
const prs = require("../../api/storage/prs");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const record_1 = require("@quenk/noni/lib/data/record");
const response_1 = require("../../api/response");
const control_1 = require("../../api/control");
const csrf_1 = require("../../api/csrf");
const api_1 = require("../../api");
exports.DEFAULT_SEND_COOKIE_NAME = 'xsrf-token';
exports.ERROR_TOKEN_INVALID = 'EBADCSRFTOKEN';
exports.PRS_CSRF_TOKEN = '$csrf.token';
exports.PRS_VIEW_CSRF_TOKEN = `${response_1.PRS_VIEW_CONTEXT}.csrf.token`;
const defaultOptions = {
    send_cookie: false,
    send_cookie_name: exports.DEFAULT_SEND_COOKIE_NAME,
    options: {}
};
const readMethods = ['GET', 'HEAD', 'OPTIONS'];
/**
 * CSRFTokenStage configures middleware to help protect against CSRF attacks.
 *
 * This requires app.session.enable to be set to true.
 */
class CSRFTokenStage {
    constructor(modules) {
        this.modules = modules;
        this.name = 'csrf-token';
    }
    execute() {
        let { modules } = this;
        return future_1.fromCallback(cb => {
            record_1.map(modules, m => {
                if (m.template &&
                    m.template.app &&
                    m.template.app.csrf &&
                    m.template.app.csrf.token &&
                    m.template.app.csrf.token.enable) {
                    let conf = record_1.merge(defaultOptions, m.template.app.csrf.token);
                    m.app.use(csurf(conf.options));
                    if (conf.send_cookie) {
                        m.app.all('*', (req, res, next) => {
                            if (readMethods.indexOf(req.method) > -1)
                                res.cookie(conf.send_cookie_name, req.csrfToken());
                            next();
                        });
                    }
                    if (conf.on && conf.on.failure) {
                        let filters = [conf.on.failure];
                        //XXX:The casts to Type are used here because @types/express
                        //has gone wacky. I don't have time for these shenanigans.
                        //See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/40138
                        let handler = (err, req, res, next) => {
                            if (err.code !== exports.ERROR_TOKEN_INVALID)
                                return next();
                            m.module.runInContext(filters)(req, res, next);
                        };
                        m.app.use(handler);
                    }
                    m.module.addBefore(setCSRFToken);
                }
            });
            return cb(null);
        });
    }
}
exports.CSRFTokenStage = CSRFTokenStage;
// Ensures the csrf token is available via prs and to views.
const setCSRFToken = (r) => api_1.doAction(function* () {
    let token = yield csrf_1.getToken();
    yield prs.set(exports.PRS_CSRF_TOKEN, token);
    yield prs.set(exports.PRS_VIEW_CSRF_TOKEN, token);
    return control_1.next(r);
});
//# sourceMappingURL=csrf-token.js.map