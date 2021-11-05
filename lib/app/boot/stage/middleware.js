"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareStage = void 0;
const future_1 = require("@quenk/noni/lib/control/monad/future");
const record_1 = require("@quenk/noni/lib/data/record");
const either_1 = require("@quenk/noni/lib/data/either");
const maybe_1 = require("@quenk/noni/lib/data/maybe");
/**
 * MiddlewareStage installs the express middleware configured for
 * each module.
 */
class MiddlewareStage {
    constructor(app, modules) {
        this.app = app;
        this.modules = modules;
        this.name = 'middleware';
    }
    execute() {
        let { modules } = this;
        return (0, future_1.fromCallback)(cb => {
            let init = (0, either_1.right)(undefined);
            let result = (0, record_1.reduce)(modules, init, (prev, mData) => {
                if (prev.isLeft())
                    return prev;
                let exApp = mData.app;
                exApp.use(beforeMiddleware(mData));
                let emwares = getMiddlewareByNames(mData, mData.middleware.enabled);
                if (emwares.isLeft())
                    return (0, either_1.left)(emwares.takeLeft());
                emwares.takeRight().forEach(mware => exApp.use(mware));
                return prev;
            });
            result.isLeft() ? cb(result.takeLeft()) : cb(null);
        });
    }
}
exports.MiddlewareStage = MiddlewareStage;
// Ensures disabled and redirecting Modules are respected.
const beforeMiddleware = (mData) => (_, res, next) => {
    if (mData.disabled === true) {
        // TODO: hook into app 404 handling
        res.sendStatus(404);
    }
    else if (mData.redirect.isJust()) {
        let r = mData.redirect.get();
        res.redirect(r.status, r.location);
    }
    else {
        next();
    }
};
const getMiddlewareByNames = (mData, names) => {
    let results = names.map(name => getMiddlewareByName(mData, name));
    let allFound = results.map(r => r.isJust());
    if (allFound)
        return (0, either_1.right)(results.map(r => r.get()));
    let missing = results.map((r, idx) => r.isNothing() ? names[idx] : '');
    return (0, either_1.left)(namesNotFoundErr(mData.path, missing.filter(name => name)));
};
// TODO: Migrate to App. See issue #45
const getMiddlewareByName = (mData, name) => {
    let result = (0, maybe_1.fromNullable)(mData.middleware.available[name]);
    if (result.isJust())
        return result;
    else if (mData.parent.isJust())
        return getMiddlewareByName(mData.parent.get(), name);
    else
        return result;
};
const namesNotFoundErr = (path, names) => new Error(`${path}: The following middleware could not be found: ` +
    `${names.join()}!`);
//# sourceMappingURL=middleware.js.map