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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ask = exports.Ask = exports.Response = exports.Request = exports.tell = exports.Tell = exports.self = exports.Self = void 0;
var uuid = require("uuid");
var path_1 = require("path");
var free_1 = require("@quenk/noni/lib/control/monad/free");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var function_1 = require("@quenk/noni/lib/data/function");
var resident_1 = require("@quenk/potoo/lib/actor/resident");
var case_1 = require("@quenk/potoo/lib/actor/resident/case");
var __1 = require("../");
/**
 * Self instruction.
 */
var Self = /** @class */ (function (_super) {
    __extends(Self, _super);
    function Self(next) {
        var _this = _super.call(this, next) || this;
        _this.next = next;
        return _this;
    }
    Self.prototype.map = function (f) {
        return new Self(function_1.compose(this.next, f));
    };
    Self.prototype.exec = function (ctx) {
        return future_1.pure(this.next(ctx.module.self()));
    };
    return Self;
}(__1.Action));
exports.Self = Self;
/**
 * self provides the address of the module.
 */
exports.self = function () {
    return free_1.liftF(new Self(function_1.identity));
};
/**
 * Tell action.
 */
var Tell = /** @class */ (function (_super) {
    __extends(Tell, _super);
    function Tell(to, message, next) {
        var _this = _super.call(this, next) || this;
        _this.to = to;
        _this.message = message;
        _this.next = next;
        return _this;
    }
    Tell.prototype.map = function (f) {
        return new Tell(this.to, this.message, f(this.next));
    };
    Tell.prototype.exec = function (ctx) {
        var _this = this;
        return future_1.pure(ctx.module.tell(this.to, this.message))
            .map(function () { return _this.next; });
    };
    return Tell;
}(__1.Action));
exports.Tell = Tell;
/**
 * tell sends a message to another actor.
 */
exports.tell = function (to, m) {
    return free_1.liftF(new Tell(to, m, undefined));
};
var Callback = /** @class */ (function (_super) {
    __extends(Callback, _super);
    function Callback(pattern, f, app) {
        var _this = _super.call(this, app) || this;
        _this.pattern = pattern;
        _this.f = f;
        _this.app = app;
        _this.receive = [
            new case_1.Case(_this.pattern, function (a) { _this.f(a); })
        ];
        return _this;
    }
    Callback.prototype.run = function () {
    };
    return Callback;
}(resident_1.Temp));
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
        return new future_1.Run(function (s) {
            var id = uuid.v4();
            var cb = function (t) { return s.onSuccess(t.value); };
            ctx.module.spawn({
                id: id,
                create: function (a) { return new Callback(Response, cb, a); }
            });
            ctx.module.tell(to, new Request(path_1.resolve(ctx.module.self() + "/" + id), message));
            return function () { };
        })
            .chain(function (v) { return future_1.pure(next(v)); });
    };
    return Ask;
}(__1.Action));
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
//# sourceMappingURL=actor.js.map