"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = exports.Redirect = exports.Enable = exports.Disable = void 0;
const express = require("express");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const record_1 = require("@quenk/noni/lib/data/record");
const case_1 = require("@quenk/potoo/lib/actor/resident/case");
const immutable_1 = require("@quenk/potoo/lib/actor/resident/immutable");
const csrf_token_1 = require("../boot/stage/csrf-token");
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
 * matches incoming requests.
 */
class Module extends immutable_1.Immutable {
    constructor(app, routeInfo = defaultRouteInfo()) {
        super(app);
        this.app = app;
        this.routeInfo = routeInfo;
        /**
         * runInContext given a final RouteConf, produces an express request handler
         * that executes each filter sequentially.
         */
        this.runInContext = (route) => (req, res, next) => {
            new api_1.Context(this, request_1.ClientRequest.fromExpress(req, route), res, next, route.filters.slice()).run();
        };
        /**
         * runIn404Context is used when a 404 handler filter is installed.
         */
        this.runIn404Context = (filter) => (req, res, next) => this.runInContext({
            method: req.method,
            path: '404',
            filters: [filter],
            tags: {}
        })(req, res, next);
        /**
         * runInContextWithError is used when an error occurs during request
         * handling.
         */
        this.runInContextWithError = (filter) => (err, req, res, next) => {
            new api_1.Context(this, request_1.ClientRequest.fromExpress(req, {
                method: req.method,
                path: '?',
                filters: [],
                tags: {}
            }), res, next, [(r) => filter(err, r)]).run();
        };
        /**
         * runInCSRFErrorContext is used for CSRF error handling.
         */
        this.runInCSRFErrorContext = (filters) => (err, req, res, next) => {
            if (err.code !== csrf_token_1.ERROR_TOKEN_INVALID)
                return next();
            this.runInContext({
                method: req.method,
                path: '?',
                filters,
                tags: {}
            })(req, res, next);
        };
    }
    receive() {
        return [
            new case_1.Case(Disable, () => this.disable()),
            new case_1.Case(Enable, () => this.enable()),
            new case_1.Case(Redirect, (r) => this.redirect(r.location, r.status))
        ];
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
     * These routes are later installed to the result of getRouter().
     */
    addRoute(conf) {
        let { routes } = this.routeInfo;
        if (routes[conf.path] != null) {
            let route = routes[conf.path];
            if (route[conf.method] != null)
                route[conf.method] = [...route[conf.method], conf];
            else
                route[conf.method] = [conf];
        }
        else {
            routes[conf.path] = { [conf.method]: [conf] };
        }
        return this;
    }
    /**
     * addRoutes
     * @deprecated
     */
    addRoutes(routes) {
        routes.forEach(r => this.addRoute(r));
        return this;
    }
    disable() {
        (0, data_1.getModule)(this.app.modules, this.self())
            .map(m => { m.disabled = true; })
            .orJust(() => console.warn(`${this.self()}: Cannot be disabled!`))
            .get();
    }
    enable() {
        (0, data_1.getModule)(this.app.modules, this.self())
            .map(m => { m.disabled = false; m.redirect = (0, maybe_1.nothing)(); })
            .orJust(() => console.warn(`${this.self()}: Cannot be enabled!`))
            .get();
    }
    redirect(location, status) {
        (0, data_1.getModule)(this.app.modules, this.self())
            .map(m => { m.redirect = (0, maybe_1.just)({ location, status }); })
            .orJust(() => console.warn(`${this.self()}: Cannot be enabled!`))
            .get();
    }
    /**
     * show constructors a Filter for displaying a view.
     */
    show(name, ctx) {
        return () => (0, response_1.show)(name, ctx);
    }
    /**
     * getRouter provides the [[express.Router]] for the Module.
     */
    getRouter() {
        let router = express.Router();
        let { before, routes } = this.routeInfo;
        (0, record_1.forEach)(routes, (methodConfs, path) => {
            (0, record_1.forEach)(methodConfs, (confs, method) => {
                let filters = before.slice();
                let tags = {};
                confs.forEach(conf => {
                    filters = [...filters, ...conf.filters];
                    tags = (0, record_1.merge)(tags, conf.tags);
                });
                router[method](path, this.runInContext({
                    method,
                    path,
                    filters,
                    tags
                }));
            });
        });
        return router;
    }
    run() { }
}
exports.Module = Module;
//# sourceMappingURL=index.js.map