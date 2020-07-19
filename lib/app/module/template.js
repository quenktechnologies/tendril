"use strict";
exports.__esModule = true;
exports.getConnections = exports.getHooks = exports.getServerConf = exports.getShowFun = exports.getRoutes = exports.getEnabledMiddleware = exports.getAvailableMiddleware = void 0;
var maybe_1 = require("@quenk/noni/lib/data/maybe");
var record_1 = require("@quenk/noni/lib/data/record");
/**
 * getAvailableMiddleware extracts a map of available middleware
 * from a Template.
 */
exports.getAvailableMiddleware = function (t) {
    return (t.app && t.app.middleware && t.app.middleware.available) ?
        record_1.map(t.app.middleware.available, function (m) {
            return m.provider.apply(null, m.options || []);
        }) : {};
};
/**
 * getEnabledMiddleware extracts the list of enabled middleware.
 */
exports.getEnabledMiddleware = function (t) {
    return (t.app && t.app.middleware && t.app.middleware.enabled) ?
        t.app.middleware.enabled : [];
};
/**
 * getRoutes provides the route function from a Template.
 */
exports.getRoutes = function (t) {
    return (t.app && t.app.routes) ? t.app.routes : function () { return []; };
};
/**
 * getShowFun provides the "show" function of a Template.
 *
 * If not specified, the parent show function is used.
 */
exports.getShowFun = function (t, parent) {
    return (t.app && t.app.views) ?
        maybe_1.just(t.app.views.provider.apply(null, t.app.views.options || [])) :
        parent.chain(function (m) { return m.show; });
};
/**
 * getServerConf provides the server configuration for the app.
 */
exports.getServerConf = function (t, defaults) {
    return record_1.merge(defaults, (t.server == null) ? {} : t.server);
};
/**
 * getHooks provides the hook handlers configuration from a template.
 */
exports.getHooks = function (t) {
    return (t.app && t.app.on) ? t.app.on : {};
};
/**
 * getConnections provides the connections from a template.
 */
exports.getConnections = function (t) {
    if (t.connections == null)
        return {};
    return record_1.reduce(t.connections, {}, function (p, c, k) {
        if (c.connector == null)
            return p;
        p[k] = (c.options != null) ?
            c.connector.apply(null, c.options) :
            c.connector();
        return p;
    });
};
