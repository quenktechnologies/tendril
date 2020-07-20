"use strict";
/**
 * The session storage module provides apis for storing session data.
 *
 * "app.session.enable" must be set to true in order for these apis to work,
 * they fail silently otherwise.
 */
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
exports.save = exports.destroy = exports.regenerate = exports.exists = exports.remove = exports.set = exports.get = exports.Save = exports.Destroy = exports.Regenerate = exports.Exists = exports.Remove = exports.Set = exports.Get = void 0;
var future_1 = require("@quenk/noni/lib/control/monad/future");
var function_1 = require("@quenk/noni/lib/data/function");
var free_1 = require("@quenk/noni/lib/control/monad/free");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var __1 = require("../");
/**
 * Get
 * @private
 */
var Get = /** @class */ (function (_super) {
    __extends(Get, _super);
    function Get(key, next) {
        var _this = _super.call(this, next) || this;
        _this.key = key;
        _this.next = next;
        return _this;
    }
    Get.prototype.map = function (f) {
        return new Get(this.key, function_1.compose(this.next, f));
    };
    Get.prototype.exec = function (ctx) {
        var session = ctx.request.session || {};
        return future_1.pure(this.next(maybe_1.fromNullable(session[this.key])));
    };
    return Get;
}(__1.Api));
exports.Get = Get;
/**
 * Set
 * @private
 */
var Set = /** @class */ (function (_super) {
    __extends(Set, _super);
    function Set(key, value, next) {
        var _this = _super.call(this, next) || this;
        _this.key = key;
        _this.value = value;
        _this.next = next;
        return _this;
    }
    Set.prototype.map = function (f) {
        return new Set(this.key, this.value, f(this.next));
    };
    Set.prototype.exec = function (ctx) {
        var session = ctx.request.session || {};
        session[this.key] = this.value;
        return future_1.pure(this.next);
    };
    return Set;
}(__1.Api));
exports.Set = Set;
/**
 * Remove
 * @private
 */
var Remove = /** @class */ (function (_super) {
    __extends(Remove, _super);
    function Remove(key, next) {
        var _this = _super.call(this, next) || this;
        _this.key = key;
        _this.next = next;
        return _this;
    }
    Remove.prototype.map = function (f) {
        return new Remove(this.key, f(this.next));
    };
    Remove.prototype.exec = function (ctx) {
        var session = ctx.request.session || {};
        delete session[this.key];
        return future_1.pure(this.next);
    };
    return Remove;
}(__1.Api));
exports.Remove = Remove;
/**
 * Exists
 * @private
 */
var Exists = /** @class */ (function (_super) {
    __extends(Exists, _super);
    function Exists(key, next) {
        var _this = _super.call(this, next) || this;
        _this.key = key;
        _this.next = next;
        return _this;
    }
    Exists.prototype.map = function (f) {
        return new Exists(this.key, function_1.compose(this.next, f));
    };
    Exists.prototype.exec = function (ctx) {
        var session = ctx.request.session || {};
        return future_1.pure(this.next(maybe_1.fromNullable(session[this.key]).isJust()));
    };
    return Exists;
}(__1.Api));
exports.Exists = Exists;
/**
 * Regenerate
 * @private
 */
var Regenerate = /** @class */ (function (_super) {
    __extends(Regenerate, _super);
    function Regenerate(next) {
        var _this = _super.call(this, next) || this;
        _this.next = next;
        return _this;
    }
    Regenerate.prototype.map = function (f) {
        return new Regenerate(f(this.next));
    };
    Regenerate.prototype.exec = function (_a) {
        var _this = this;
        var request = _a.request;
        if (request.session != null) {
            var session_1 = request.session;
            return future_1.fromCallback(function (cb) { return session_1.regenerate(cb); })
                .chain(function () { return future_1.pure(_this.next); });
        }
        return future_1.pure(this.next);
    };
    return Regenerate;
}(__1.Api));
exports.Regenerate = Regenerate;
/**
 * Destroy
 * @private
 */
var Destroy = /** @class */ (function (_super) {
    __extends(Destroy, _super);
    function Destroy(next) {
        var _this = _super.call(this, next) || this;
        _this.next = next;
        return _this;
    }
    Destroy.prototype.map = function (f) {
        return new Destroy(f(this.next));
    };
    Destroy.prototype.exec = function (_a) {
        var _this = this;
        var request = _a.request;
        if (request.session != null) {
            var session_2 = request.session;
            return future_1.fromCallback(function (cb) { return session_2.destroy(cb); })
                .chain(function () { return future_1.pure(_this.next); });
        }
        return future_1.pure(this.next);
    };
    return Destroy;
}(__1.Api));
exports.Destroy = Destroy;
/**
 * Save
 * @private
 */
var Save = /** @class */ (function (_super) {
    __extends(Save, _super);
    function Save(next) {
        var _this = _super.call(this, next) || this;
        _this.next = next;
        return _this;
    }
    Save.prototype.map = function (f) {
        return new Save(f(this.next));
    };
    Save.prototype.exec = function (_a) {
        var _this = this;
        var request = _a.request;
        if (request.session != null) {
            var session_3 = request.session;
            return future_1.fromCallback(function (cb) { return session_3.save(cb); })
                .chain(function () { return future_1.pure(_this.next); });
        }
        return future_1.pure(this.next);
    };
    return Save;
}(__1.Api));
exports.Save = Save;
/**
 * get a value from session by key.
 *
 * The value is is wrapped in a Maybe to promote safe access.
 */
exports.get = function (key) {
    return free_1.liftF(new Get(key, function_1.identity));
};
/**
 * set a value for a key in the session.
 */
exports.set = function (key, value) {
    return free_1.liftF(new Set(key, value, undefined));
};
/**
 * remove a value from the session.
 */
exports.remove = function (key) {
    return free_1.liftF(new Remove(key, undefined));
};
/**
 * exists checks whether a value exists in the session.
 */
exports.exists = function (key) {
    return free_1.liftF(new Exists(key, function_1.identity));
};
/**
 * regenerate causes the session to be regenerated and a new SID set.
 */
exports.regenerate = function () {
    return free_1.liftF(new Regenerate(undefined));
};
/**
 * destroy the session.
 */
exports.destroy = function () {
    return free_1.liftF(new Destroy(undefined));
};
/**
 * Save session data.
 *
 * This causes session data to be stored immediately instead of at the end
 * of the request.
 */
exports.save = function () {
    return free_1.liftF(new Save(undefined));
};
//# sourceMappingURL=session.js.map