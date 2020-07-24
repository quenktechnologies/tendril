"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStage = exports.WARN_NO_SECRET = exports.SESSION_COOKIE_NAME = void 0;
const session = require("express-session");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const monad_1 = require("@quenk/noni/lib/control/monad");
const record_1 = require("@quenk/noni/lib/data/record");
const function_1 = require("@quenk/noni/lib/data/function");
const memory_1 = require("../../middleware/session/store/provider/memory");
const cookie_parser_1 = require("./cookie-parser");
exports.SESSION_COOKIE_NAME = 'tendril.session.id';
exports.WARN_NO_SECRET = '[SessionStage]: Warning! No app.session.options.secret configured! \
A random string will be generated and used however this means user sessions\
will not be valid if the application restarts!';
const defaultOptions = {
    enable: false,
    options: {
        name: exports.SESSION_COOKIE_NAME,
        saveUnitialized: false,
        resave: false
    },
    store: {
        provider: new memory_1.MemoryStoreProvider,
        options: {}
    }
};
/**
 * SessionStage configures session middleware automtically if enabled.
 *
 * This will configure session support for EACH module that declares
 * "app.session.enable = true". A app.session.options.secret SHOULD be provided
 * for sigining cookies (to detect tampering). If it is not supplied the
 * following takes place:
 *
 * 1. The value is read from process.env.SESSION_SECRET or
 * 2. the value is read from process.env.COOKIE_SECRET or
 * 3. the value is read from process.env.SECRET otherwise
 * 4. a random string is generated (sessions will not survive app restarts).
 */
class SessionStage {
    constructor(modules) {
        this.modules = modules;
        this.name = 'session';
    }
    execute() {
        let { modules } = this;
        return future_1.sequential(record_1.mapTo(modules, m => monad_1.doN(function* () {
            if (m.template &&
                m.template.app &&
                m.template.app.session &&
                m.template.app.session.enable) {
                let conf = record_1.merge(defaultOptions, m.template.app.session);
                if (!conf.options.secret) {
                    if (process.env.SESSION_SECRET) {
                        conf.options.secret = process.env.SESSION_SECRET;
                    }
                    else if (process.env.COOKIE_SECRET) {
                        conf.options.secret = process.env.COOKIE_SECRET;
                    }
                    else if (process.env.SECRET) {
                        conf.options.secret = process.env.SECRET;
                    }
                    else {
                        console.warn(exports.WARN_NO_SECRET);
                        conf.options.secret = cookie_parser_1.randomSecret;
                    }
                }
                let store = yield conf.store.provider.create(session, conf.store.options);
                m.app.use(session(record_1.merge(conf.options, { store })));
            }
            return future_1.pure(undefined);
        }))).map(function_1.noop);
    }
}
exports.SessionStage = SessionStage;
//# sourceMappingURL=session.js.map