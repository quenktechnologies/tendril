"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnections = exports.getHooks = exports.getServerConf = exports.getShowFun = exports.getRoutes = exports.getEnabledMiddleware = exports.getAvailableMiddleware = void 0;
const maybe_1 = require("@quenk/noni/lib/data/maybe");
const record_1 = require("@quenk/noni/lib/data/record");
/**
 * getAvailableMiddleware extracts a map of available middleware
 * from a Template.
 */
const getAvailableMiddleware = (t) => (t.app && t.app.middleware && t.app.middleware.available) ?
    (0, record_1.map)(t.app.middleware.available, m => m.provider.apply(null, m.options || [])) : {};
exports.getAvailableMiddleware = getAvailableMiddleware;
/**
 * getEnabledMiddleware extracts the list of enabled middleware.
 */
const getEnabledMiddleware = (t) => (t.app && t.app.middleware && t.app.middleware.enabled) ?
    t.app.middleware.enabled : [];
exports.getEnabledMiddleware = getEnabledMiddleware;
/**
 * getRoutes provides the route function from a Template.
 */
const getRoutes = (t) => (t.app && t.app.routes) ? t.app.routes : () => [];
exports.getRoutes = getRoutes;
/**
 * getShowFun provides the "show" function of a Template.
 *
 * If not specified, the parent show function is used.
 */
const getShowFun = (t, parent) => (t.app && t.app.views) ?
    (0, maybe_1.just)(t.app.views.provider.apply(null, t.app.views.options || [])) :
    parent.chain(m => m.show);
exports.getShowFun = getShowFun;
/**
 * getServerConf provides the server configuration for the app.
 */
const getServerConf = (t, defaults) => (0, record_1.merge)(defaults, (t.server == null) ? {} : t.server);
exports.getServerConf = getServerConf;
/**
 * getHooks provides the hook handlers configuration from a template.
 */
const getHooks = (t) => (t.app && t.app.on) ? t.app.on : {};
exports.getHooks = getHooks;
/**
 * getConnections provides the connections from a template.
 */
const getConnections = (t) => {
    if (t.connections == null)
        return {};
    return (0, record_1.reduce)(t.connections, {}, (p, c, k) => {
        if (c.connector == null)
            return p;
        p[k] = (c.options != null) ?
            c.connector.apply(null, c.options) :
            c.connector();
        return p;
    });
};
exports.getConnections = getConnections;
//# sourceMappingURL=template.js.map