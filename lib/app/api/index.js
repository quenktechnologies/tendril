"use strict";
/**
 *
 * The api module provides the functions, classes and types used to build
 * a responses to client requests in an app.
 *
 * We use a the Future class from noni for asynchrounous work and
 * a Free monad based DSL for determining what to send the client.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var headers = require("./http/headers");
var free_1 = require("@quenk/noni/lib/control/monad/free");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var function_1 = require("@quenk/noni/lib/data/function");
var context_1 = require("../state/context");
/**
 * Context represents the context of the http request.
 *
 * It provides an api that assits with filtering the request and response.
 */
var Context = /** @class */ (function () {
    function Context(module, request, response, filters) {
        this.module = module;
        this.request = request;
        this.response = response;
        this.filters = filters;
    }
    Context.prototype.next = function () {
        return (this.filters.length > 0) ?
            this.filters.shift()(this.request) :
            future_1.raise(new Error(this.module.self() + ": No more filters!"));
    };
    /**
     * run processes the next filter or action in the chain.
     */
    Context.prototype.run = function () {
        var _this = this;
        //@todo escalate errors
        this
            .next()
            .chain(function (n) { return n.foldM(function () { return future_1.pure(function_1.noop()); }, function (n) { return n.exec(_this); }); })
            .fork(console.error, console.log);
    };
    return Context;
}());
exports.Context = Context;
/**
 * Action represents the result of a client request.
 *
 * It is implemented as a Functor DSL meant to be interpreted
 * later in a Free monad.
 */
var Action = /** @class */ (function () {
    function Action(next) {
        this.next = next;
    }
    return Action;
}());
exports.Action = Action;
/**
 * Next action.
 */
var Next = /** @class */ (function (_super) {
    __extends(Next, _super);
    function Next(request, next) {
        var _this = _super.call(this, next) || this;
        _this.request = request;
        _this.next = next;
        return _this;
    }
    Next.prototype.map = function (f) {
        return new Next(this.request, f(this.next));
    };
    Next.prototype.exec = function (ctx) {
        ctx.request = this.request;
        return ctx.next();
    };
    return Next;
}(Action));
exports.Next = Next;
/**
 * Show action.
 */
var Show = /** @class */ (function (_super) {
    __extends(Show, _super);
    function Show(view, context, next) {
        var _this = _super.call(this, next) || this;
        _this.view = view;
        _this.context = context;
        _this.next = next;
        return _this;
    }
    Show.prototype.map = function (f) {
        return new Show(this.view, this.context, f(this.next));
    };
    Show.prototype.exec = function (_a) {
        var _this = this;
        var response = _a.response, module = _a.module;
        return context_1.getModule(module.system.state, module.self())
            .chain(function (m) { return m.show; })
            .map(function (f) {
            return f(_this.view, _this.context)
                .chain(function (c) {
                response.set(headers.CONTENT_TYPE, c.type);
                response.write(c.content);
                response.end();
                return future_1.pure(_this.next);
            });
        })
            .orJust(function () { return future_1.raise(new Error(module.self() + ": " +
            "No view engine configured!")); })
            .get();
    };
    return Show;
}(Action));
exports.Show = Show;
/**
 * Wait action.
 */
var Wait = /** @class */ (function (_super) {
    __extends(Wait, _super);
    function Wait(f, next) {
        var _this = _super.call(this, next) || this;
        _this.f = f;
        _this.next = next;
        return _this;
    }
    Wait.prototype.map = function (f) {
        return new Wait(this.f, f(this.next));
    };
    Wait.prototype.exec = function (ctx) {
        var _this = this;
        return this.f.chain(function (n) {
            return n.foldM(function () { return future_1.pure(function_1.noop()); }, function (n) { return n.exec(ctx); });
        })
            .chain(function () { return future_1.pure(_this.next); });
    };
    return Wait;
}(Action));
exports.Wait = Wait;
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
}(Action));
exports.Tell = Tell;
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
}(Action));
exports.Self = Self;
/**
 * next gives the go ahead to interpret the
 * actions of the next Filter chain.
 *
 * This action allows the Request in the context to be modified and
 * short-circuits the current chain.
 */
exports.next = function (r) { return free_1.liftF(new Next(r, undefined)); };
/**
 * show the client some content.
 */
exports.show = function (view, context) {
    return free_1.liftF(new Show(view, maybe_1.fromNullable(context), undefined));
};
/**
 * wait on an asynchrounous operation to acquire the next
 * action to carry out.
 */
exports.wait = function (f) {
    return free_1.liftF(new Wait(f, undefined));
};
/**
 * tell sends a message to another actor.
 */
exports.tell = function (to, m) {
    return free_1.liftF(new Tell(to, m, undefined));
};
/**
 * self provides the address of the module.
 */
exports.self = function () {
    return free_1.liftF(new Self(function_1.identity));
};
//# sourceMappingURL=index.js.map