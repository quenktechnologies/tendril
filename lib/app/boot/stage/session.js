"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSessionTTL = exports.SessionStage = exports.WARN_NO_SECRET = exports.POOL_KEY_SESSION = exports.SESSION_COOKIE_NAME = void 0;
const session = require("express-session");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const monad_1 = require("@quenk/noni/lib/control/monad");
const record_1 = require("@quenk/noni/lib/data/record");
const function_1 = require("@quenk/noni/lib/data/function");
const type_1 = require("@quenk/noni/lib/data/type");
const memory_1 = require("../../middleware/session/store/connection/memory");
const session_1 = require("../../api/storage/session");
const cookie_parser_1 = require("./cookie-parser");
exports.SESSION_COOKIE_NAME = 'tendril.session.id';
exports.POOL_KEY_SESSION = '$tendril-session-store-connection';
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
        provider: () => new memory_1.MemoryConnection(),
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
    constructor(modules, pool) {
        this.modules = modules;
        this.pool = pool;
        this.name = 'session';
    }
    execute() {
        let { modules, pool } = this;
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
                let conn = conf.store.provider(session, conf.store.options);
                yield conn.open();
                let store = yield conn.checkout();
                pool.add(exports.POOL_KEY_SESSION, conn);
                m.app.use(session(record_1.merge(conf.options, { store })));
                m.app.use(exports.handleSessionTTL);
            }
            return future_1.pure(undefined);
        }))).map(function_1.noop);
    }
}
exports.SessionStage = SessionStage;
/**
 * handleSessionTTL is responsible for:
 * 1. Removing session values that have reached TTL 0.
 * 2. Decrementing session values that have their TTL set.
 * @private
 */
exports.handleSessionTTL = (req, _, next) => {
    if (req.session &&
        type_1.isObject(req.session[session_1.SESSION_DATA]) &&
        type_1.isObject(req.session[session_1.SESSION_DESCRIPTORS])) {
        let session = req.session;
        let descs = req.session[session_1.SESSION_DESCRIPTORS];
        descs = record_1.map(descs, (d, k) => {
            if ((d.ttl != null) && type_1.isNumber(d.ttl)) {
                if (d.ttl === 0) {
                    session_1.deleteSessionKey(session, k);
                }
                else {
                    d.ttl = d.ttl - 1;
                }
            }
            return d;
        });
        session[session_1.SESSION_DESCRIPTORS] = descs;
    }
    next();
};
//# sourceMappingURL=session.js.map