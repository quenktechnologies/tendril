"use strict";
/**
 * The Per Request Storage module (PRS) provides an API for storing small
 * amounts of data that exist only for the duration of a request.
 *
 * This APIs primary purpose is to provide a way for filters to share data
 * with each other, without modifying the Request object.
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
exports.exists = exports.remove = exports.set = exports.get = exports.Exists = exports.Remove = exports.Set = exports.Get = void 0;
/** imports */
var path = require("@quenk/noni/lib/data/record/path");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var free_1 = require("@quenk/noni/lib/control/monad/free");
var function_1 = require("@quenk/noni/lib/data/function");
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
        return future_1.pure(this.next(path.get(this.key, ctx.prs)));
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
        ctx.prs = path.set(this.key, this.value, ctx.prs);
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
        var prs = path.flatten(ctx.prs);
        delete prs[this.key];
        ctx.prs = path.unflatten(prs);
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
        return future_1.pure(this.next(path.get(this.key, ctx.prs).isJust()));
    };
    return Exists;
}(__1.Api));
exports.Exists = Exists;
/**
 * get a value from PRS.
 *
 * The value is is wrapped in a Maybe to promote safe access.
 */
exports.get = function (key) {
    return free_1.liftF(new Get(key, function_1.identity));
};
/**
 * set will store a value in the PRS that can be later
 * read by filters or handlers that follow.
 *
 * When setting values it is recommended to use to namespace keys to avoid
 * collisions. For example:
 *
 * set('resource.search.query', {name: 'foo'});
 */
exports.set = function (key, value) {
    return free_1.liftF(new Set(key, value, undefined));
};
/**
 * remove a value from PRS.
 */
exports.remove = function (key) {
    return free_1.liftF(new Remove(key, undefined));
};
/**
 * exists checks whether a value exists in PRS or not.
 */
exports.exists = function (key) {
    return free_1.liftF(new Exists(key, function_1.identity));
};
//# sourceMappingURL=prs.js.map