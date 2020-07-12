"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStage = exports.WARN_NO_SECRET = exports.SESSION_COOKIE_NAME = void 0;
var session = require("express-session");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var monad_1 = require("@quenk/noni/lib/control/monad");
var record_1 = require("@quenk/noni/lib/data/record");
var function_1 = require("@quenk/noni/lib/data/function");
var memory_1 = require("../../middleware/session/store/provider/memory");
exports.SESSION_COOKIE_NAME = 'tendril.session.id';
exports.WARN_NO_SECRET = '[SessionStage]: Warning! No app.session.options.secret configured! \
A random string will be generated and used however this means user sessions\
will not be valid if the application restarts!';
var defaultOptions = {
    enabled: false,
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
 * "app.session.enabled = true". A app.session.options.secret SHOULD be provided
 * for sigining cookies (to detect tampering). If it is not supplied the
 * following takes place:
 *
 * 1. The value is read from process.env.SESSION_SECRET or
 * 2. the value is read from process.env.COOKIE_SECRET or
 * 3. the value is read from process.env.SECRET otherwise
 * 4. a random string is generated (sessions will not survive app restarts).
 */
var SessionStage = /** @class */ (function () {
    function SessionStage(modules) {
        this.modules = modules;
        this.name = 'session';
    }
    SessionStage.prototype.execute = function () {
        var modules = this.modules;
        return future_1.sequential(record_1.mapTo(modules, function (m) { return monad_1.doN(function () {
            var conf, store;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(m.template &&
                            m.template.app &&
                            m.template.app.session &&
                            m.template.app.session.enabled)) return [3 /*break*/, 2];
                        conf = record_1.merge(defaultOptions, m.template.app.session);
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
                                conf.options.secret = defaultSecret();
                            }
                        }
                        return [4 /*yield*/, conf.store.provider.create(session, conf.store.options)];
                    case 1:
                        store = _a.sent();
                        m.app.use(session(record_1.merge(conf.options, { store: store })));
                        _a.label = 2;
                    case 2: return [2 /*return*/, future_1.pure(undefined)];
                }
            });
        }); })).map(function_1.noop);
    };
    return SessionStage;
}());
exports.SessionStage = SessionStage;
var defaultSecret = function () {
    return (Math
        .random()
        .toString(36)
        .substring(2, 15)) +
        (Math
            .random()
            .toString(36)
            .substring(2, 15));
};
//# sourceMappingURL=session.js.map