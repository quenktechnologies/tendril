"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = exports.Redirect = exports.Enable = exports.Disable = void 0;
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const case_1 = require("@quenk/potoo/lib/actor/resident/case");
const resident_1 = require("@quenk/potoo/lib/actor/resident");
const data_1 = require("../module/data");
const response_1 = require("../api/response");
const api_1 = require("../api");
/**
 * Disable a Module.
 *
 * All requests to the Module will 404.
 */
class Disable {
}
exports.Disable = Disable;
/**
 * Enable a Module.
 */
class Enable {
}
exports.Enable = Enable;
/**
 * Redirect requests to the module to another location.
 */
class Redirect {
    constructor(status, location) {
        this.status = status;
        this.location = location;
    }
}
exports.Redirect = Redirect;
/**
 * Module of the application.
 *
 * A tendril application breaks up it's routes and related code
 * into a series of modules. Each module is an actor with the
 * ability to send and receive messages.
 *
 * Most actions of a Module are implemented using Api classes that
 * are executed by the App.
 *
 * This makes debugging slightly easier as we can review to some extent what
 * individual modules are doing via the op log.
 */
class Module extends resident_1.Immutable {
    constructor(system) {
        super(system);
        this.system = system;
        this.receive = [
            new case_1.Case(Disable, () => this.disable()),
            new case_1.Case(Enable, () => this.enable()),
            new case_1.Case(Redirect, (r) => this.redirect(r.location, r.status))
        ];
        /**
         * runInContext given a list of filters, produces an
         * express request handler where the action is the
         * interpretation of the filters.
         */
        this.runInContext = (filters) => (req, res, next) => {
            new api_1.Context(this, req, res, next, filters.slice()).run();
        };
        /**
         * runInContextWithError is used when an error occurs during request
         * handling.
         */
        this.runInContextWithError = (filter) => (err, req, res, next) => {
            new api_1.Context(this, req, res, next, [(r) => filter(err, r)]).run();
        };
    }
    /**
     * install routes into the routing table for this module.
     */
    install(routes) {
        let maybeModule = data_1.getModule(this.system.modules, this.self());
        if (maybeModule.isJust()) {
            let m = maybeModule.get();
            routes.forEach(({ path, method, filters }) => {
                m.app[method](path, this.runInContext(filters));
            });
        }
    }
    disable() {
        data_1.getModule(this.system.modules, this.self())
            .map(m => { m.disabled = true; })
            .orJust(() => console.warn(`${this.self()}: Cannot be disabled!`))
            .get();
    }
    enable() {
        data_1.getModule(this.system.modules, this.self())
            .map(m => { m.disabled = false; m.redirect = maybe_1.nothing(); })
            .orJust(() => console.warn(`${this.self()}: Cannot be enabled!`))
            .get();
    }
    redirect(location, status) {
        data_1.getModule(this.system.modules, this.self())
            .map(m => { m.redirect = maybe_1.just({ location, status }); })
            .orJust(() => console.warn(`${this.self()}: Cannot be enabled!`))
            .get();
    }
    /**
     * show constructrs a Filter for displaying a view.
     */
    show(name, ctx) {
        return () => response_1.show(name, ctx);
    }
    run() { }
}
exports.Module = Module;
//# sourceMappingURL=index.js.map