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
        return (0, future_1.attempt)(() => (0, record_1.map)(modules, mconf => {
            let mod = mconf.module;
            let exApp = mconf.app;
            let routes = mconf.routes(mod);
            let temp = mconf.template;
            let filters = getConfFilters((0, maybe_1.just)(mconf));
            if (!(0, record_1.empty)(filters)) {
                // Add the module level filters before each filter.
                mod.addRoutes(routes.map(r => (Object.assign(Object.assign({}, r), { filters: [...filters, ...r.filters] }))));
            }
            else {
                mod.addRoutes(routes);
            }
            exApp.use(mod.getRouter());
            if (temp.app && temp.app.on && temp.app.on.notFound)
                exApp.use(mod.runIn404Context(temp.app.on.notFound));
            if (temp.app && temp.app.on && temp.app.on.internalError)
                exApp.use(mod.runInContextWithError(temp.app.on.internalError));
            if (mconf.parent.isJust()) {
                let parentExpApp = mconf.parent.get().app;
                parentExpApp.use((0, path_1.join)('/', mconf.path), exApp);
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
            filters = [...temp.app.filters, ...filters];
        current = target.parent;
    }
    return filters;
};
//# sourceMappingURL=routing.js.map