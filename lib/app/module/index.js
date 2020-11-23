"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = exports.Redirect = exports.Enable = exports.Disable = void 0;
const express = require("express");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const record_1 = require("@quenk/noni/lib/data/record");
const case_1 = require("@quenk/potoo/lib/actor/resident/case");
const resident_1 = require("@quenk/potoo/lib/actor/resident");
const data_1 = require("../module/data");
const request_1 = require("../api/request");
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
const defaultRouteInfo = () => ({ before: [], routes: {} });
/**
 * Module of a tendril application.
 *
 * In tendril, an application is broken up into one more Modules that
 * represent the respective areas of concern. Modules are responsible
 * for configuring and handling their assigned routes (endpoints) in the
 * application and can communicate with each other via the actor API.
 *
 * Think of all the routes of a Module as one big function that pattern
 * matches incomming requests.
 */
class Module extends resident_1.Immutable {
    constructor(app, routeInfo = defaultRouteInfo()) {
        super(app);
        this.app = app;
        this.routeInfo = routeInfo;
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
            new api_1.Context(this, request_1.ClientRequest.fromExpress(req), res, next, filters.slice()).run();
        };
        /**
         * runInContextWithError is used when an error occurs during request
         * handling.
         */
        this.runInContextWithError = (filter) => (err, req, res, next) => {
            new api_1.Context(this, request_1.ClientRequest.fromExpress(req), res, next, [(r) => filter(err, r)]).run();
        };
    }
    /**
     * addBefore adds filters to the RoutingInfo that will be executed
     * before every route.
     */
    addBefore(filter) {
        this.routeInfo.before.push(filter);
        return this;
    }
    /**
     * addRoute to the internal routing table of this Module.
     *
     * The routing table is only a cache and must be installed to an
     * [[express.Application]] in order to take effect.
     */
    addRoute(method, path, filters) {
        let { routes } = this.routeInfo;
        if (routes[path] != null) {
            let route = routes[path];
            if (route[method] != null)
                route[method] = [...route[method], ...filters];
            else
                route[method] = filters;
        }
        else {
            routes[path] = { [method]: filters };
        }
        return this;
    }
    /**
     * addRoutes
     * @deprecated
     */
    addRoutes(routes) {
        routes.forEach(r => this.addRoute(r.method, r.path, r.filters));
        return this;
    }
    disable() {
        data_1.getModule(this.app.modules, this.self())
            .map(m => { m.disabled = true; })
            .orJust(() => console.warn(`${this.self()}: Cannot be disabled!`))
            .get();
    }
    enable() {
        data_1.getModule(this.app.modules, this.self())
            .map(m => { m.disabled = false; m.redirect = maybe_1.nothing(); })
            .orJust(() => console.warn(`${this.self()}: Cannot be enabled!`))
            .get();
    }
    redirect(location, status) {
        data_1.getModule(this.app.modules, this.self())
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
    /**
     * getRouter provides the [[express.Router]] for the Module.
     */
    getRouter() {
        let router = express.Router();
        let { before, routes } = this.routeInfo;
        record_1.map(routes, (conf, path) => {
            record_1.map(conf, (filters, method) => {
                let allFilters = [...before, ...filters];
                router[method](path, this.runInContext(allFilters));
            });
        });
        return router;
    }
    run() { }
}
exports.Module = Module;
//# sourceMappingURL=index.js.map