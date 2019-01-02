"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var uuid = require("uuid");
var path_1 = require("path");
var monad_1 = require("@quenk/noni/lib/control/monad");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var function_1 = require("@quenk/noni/lib/data/function");
var free_1 = require("@quenk/noni/lib/control/monad/free");
var resident_1 = require("@quenk/potoo/lib/actor/resident");
var _1 = require("./");
var Callback = /** @class */ (function (_super) {
    __extends(Callback, _super);
    function Callback(pattern, f, app) {
        var _this = _super.call(this, app) || this;
        _this.pattern = pattern;
        _this.f = f;
        _this.app = app;
        return _this;
    }
    Callback.prototype.run = function () {
        var _this = this;
        this.select([
            new resident_1.Case(this.pattern, function (a) {
                _this.f(a);
                _this.exit();
            })
        ]);
    };
    return Callback;
}(resident_1.Mutable));
/**
 * Request wraps a message to an actor in to indicate a reply is
 * expected.
 */
var Request = /** @class */ (function () {
    function Request(from, message) {
        this.from = from;
        this.message = message;
    }
    return Request;
}());
exports.Request = Request;
/**
 * Response to a Request
 */
var Response = /** @class */ (function () {
    function Response(value) {
        this.value = value;
    }
    return Response;
}());
exports.Response = Response;
/**
 * Ask action.
 */
var Ask = /** @class */ (function (_super) {
    __extends(Ask, _super);
    function Ask(to, message, next) {
        var _this = _super.call(this, next) || this;
        _this.to = to;
        _this.message = message;
        _this.next = next;
        return _this;
    }
    Ask.prototype.map = function (f) {
        return new Ask(this.to, this.message, function_1.compose(this.next, f));
    };
    Ask.prototype.exec = function (ctx) {
        var _a = this, to = _a.to, message = _a.message, next = _a.next;
        return monad_1.doN(function () {
            var value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new future_1.Run(function (s) {
                            var id = uuid();
                            var cb = function (t) { return s.onSuccess(t.value); };
                            ctx.module.tell(to, new Request(path_1.resolve(ctx.module.self() + "/" + id), message));
                            ctx.module.spawn({
                                id: id,
                                create: function (a) { return new Callback(Response, cb, a); }
                            });
                            return function () { };
                        })];
                    case 1:
                        value = _a.sent();
                        return [2 /*return*/, future_1.pure(next(value))];
                }
            });
        });
    };
    return Ask;
}(_1.Action));
exports.Ask = Ask;
/**
 * ask sends a message to another actor and awaits a reply
 * before continuing computation.
 *
 * The actor must respond with a Response message.
 */
exports.ask = function (to, m) {
    return free_1.liftF(new Ask(to, m, function_1.identity));
};
//# sourceMappingURL=ask.js.map