"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingStage = void 0;
const path_1 = require("path");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const record_1 = require("@quenk/noni/lib/data/record");
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
        return future_1.attempt(() => record_1.map(modules, m => {
            let mod = m.module;
            let t = m.template;
            let routes = m.routes(m.module);
            if (t.app && t.app.filters) {
                let filters = t.app.filters;
                mod.install(routes.map(r => ({
                    method: r.method,
                    path: r.path,
                    filters: [...filters, ...r.filters]
                })));
            }
            else {
                mod.install(routes);
            }
            if (t.app && t.app.on && t.app.on.notFound)
                m.app.use(mod.runInContext([t.app.on.notFound]));
            if (t.app && t.app.on && t.app.on.internalError)
                m.app.use(mod.runInContextWithError(t.app.on.internalError));
            m.parent.map(p => p.app.use(path_1.join('/', m.path), m.app));
        })).map(() => undefined);
    }
}
exports.RoutingStage = RoutingStage;
//# sourceMappingURL=routing.js.map