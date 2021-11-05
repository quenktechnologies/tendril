"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tell = exports.self = exports.ask = exports.Ask = exports.Response = exports.Request = exports.Tell = exports.Self = void 0;
const uuid = require("uuid");
const path_1 = require("path");
const free_1 = require("@quenk/noni/lib/control/monad/free");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const function_1 = require("@quenk/noni/lib/data/function");
const resident_1 = require("@quenk/potoo/lib/actor/resident");
const case_1 = require("@quenk/potoo/lib/actor/resident/case");
const __1 = require("../");
/**
 * Self
 * @private
 */
class Self extends __1.Api {
    constructor(next) {
        super(next);
        this.next = next;
    }
    map(f) {
        return new Self((0, function_1.compose)(this.next, f));
    }
    exec(ctx) {
        return (0, future_1.pure)(this.next(ctx.module.self()));
    }
}
exports.Self = Self;
/**
 * Tell
 * @private
 */
class Tell extends __1.Api {
    constructor(to, message, next) {
        super(next);
        this.to = to;
        this.message = message;
        this.next = next;
    }
    map(f) {
        return new Tell(this.to, this.message, f(this.next));
    }
    exec(ctx) {
        return (0, future_1.pure)(ctx.module.tell(this.to, this.message))
            .map(() => this.next);
    }
}
exports.Tell = Tell;
class Callback extends resident_1.Temp {
    constructor(pattern, f, app) {
        super(app);
        this.pattern = pattern;
        this.f = f;
        this.app = app;
        this.receive = [
            new case_1.Case(this.pattern, (a) => { this.f(a); })
        ];
    }
    run() {
    }
}
/**
 * Request wraps a message to an actor in to indicate a reply is
 * expected.
 */
class Request {
    constructor(from, message) {
        this.from = from;
        this.message = message;
    }
}
exports.Request = Request;
/**
 * Response to a Request
 */
class Response {
    constructor(value) {
        this.value = value;
    }
}
exports.Response = Response;
/**
 * Ask
 * @private
 */
class Ask extends __1.Api {
    constructor(to, message, next) {
        super(next);
        this.to = to;
        this.message = message;
        this.next = next;
    }
    map(f) {
        return new Ask(this.to, this.message, (0, function_1.compose)(this.next, f));
    }
    exec(ctx) {
        let { to, message, next } = this;
        return new future_1.Run((_, onSuccess) => {
            let id = uuid.v4();
            let cb = (t) => onSuccess(t.value);
            ctx.module.spawn({
                id,
                create: a => new Callback(Response, cb, a)
            });
            ctx.module.tell(to, new Request((0, path_1.resolve)(`${ctx.module.self()}/${id}`), message));
            return () => { };
        })
            .chain(v => (0, future_1.pure)(next(v)));
    }
}
exports.Ask = Ask;
/**
 * ask sends a message to another actor and awaits a reply
 * before continuing computation.
 *
 * The actor must respond with a Response message.
 */
const ask = (to, m) => (0, free_1.liftF)(new Ask(to, m, function_1.identity));
exports.ask = ask;
/**
 * self provides the address of the module.
 */
const self = () => (0, free_1.liftF)(new Self(function_1.identity));
exports.self = self;
/**
 * tell sends a message to another actor.
 */
const tell = (to, m) => (0, free_1.liftF)(new Tell(to, m, undefined));
exports.tell = tell;
//# sourceMappingURL=actor.js.map