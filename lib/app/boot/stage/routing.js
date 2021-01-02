"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingStage = void 0;
const path_1 = require("path");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const record_1 = require("@quenk/noni/lib/data/record");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
/**
 * RoutingStage sets up all the Application routing in one go.
 */
class RoutingStage {
    constructor(modules) {
        this.modules = modules;
        this.name = 'routing';
    }
    execute() {
        let { modules } = this;
        return future_1.attempt(() => record_1.map(modules, mconf => {
            let mod = mconf.module;
            let exApp = mconf.app;
            let routes = mconf.routes(mod);
            let temp = mconf.template;
            let filters = getConfFilters(maybe_1.just(mconf));
            if (filters.length > 0) {
                // Add the module level filters before each filter.
                mod.addRoutes(routes.map(r => ({
                    method: r.method,
                    path: r.path,
                    filters: [...filters, ...r.filters]
                })));
            }
            else {
                mod.addRoutes(routes);
            }
            exApp.use(mod.getRouter());
            if (temp.app && temp.app.on && temp.app.on.notFound)
                exApp.use(mod.runInContext([temp.app.on.notFound]));
            if (temp.app && temp.app.on && temp.app.on.internalError)
                exApp.use(mod.runInContextWithError(temp.app.on.internalError));
            if (mconf.parent.isJust()) {
                let parentExpApp = mconf.parent.get().app;
                parentExpApp.use(path_1.join('/', mconf.path), exApp);
            }
        })).map(() => undefined);
    }
}
exports.RoutingStage = RoutingStage;
/**
 * getConfFilters provides all the filters declared at the configuration
 * level.
 *
 * Filters from parent modules are inherited and are first in the list.
 */
const getConfFilters = (mdata) => {
    let filters = [];
    let current = mdata;
    while (current.isJust()) {
        let target = current.get();
        let temp = target.template;
        if (temp.app && temp.app.filters)
            filters.push.apply(filters, temp.app.filters);
        current = target.parent;
    }
    return filters.reverse();
};
//# sourceMappingURL=routing.js.map