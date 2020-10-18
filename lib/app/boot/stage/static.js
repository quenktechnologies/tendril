"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticStage = void 0;
const express = require("express");
const path_1 = require("path");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const record_1 = require("@quenk/noni/lib/data/record");
const type_1 = require("@quenk/noni/lib/data/type");
const file_1 = require("@quenk/noni/lib/io/file");
/**
 * StaticStage configures middleware for serving static files for each module.
 *
 * All configured dirs are served as one virtual directory.
 * The configuration of static paths can be a [[StaticDirConf]] or a string
 * for a single path. Multiple paths can be configured by using an array of
 * strings or StaticDirConfs or a map object of StaticDirConfs.
 *
 * They will all be expanded to a StaticDirConf before being installed.
 * By default, any folder named "public" in a module will be used to serve
 * static files.
 *
 * Note: If "app.dirs.self" is configured, all static paths will be relative
 * to its value. This is usually the path for the main module from the root
 * of the working directory.
 */
class StaticStage {
    constructor(mainProvider, modules) {
        this.mainProvider = mainProvider;
        this.modules = modules;
        this.name = 'static';
    }
    execute() {
        let { mainProvider, modules, name } = this;
        let main = mainProvider();
        return future_1.doFuture(function* () {
            yield future_1.sequential(record_1.mapTo(modules, m => future_1.doFuture(function* () {
                let prefix = '';
                let mconfs = { 'public': { dir: 'public' } };
                if (m.template) {
                    let dirs = m.template.app && m.template.app.dirs || {};
                    prefix = getPrefix(dirs.self);
                    mconfs = record_1.merge(mconfs, normalizeConf(dirs.public || {}));
                }
                let normalizedConfs = normalizeDirs(prefix, mconfs);
                if (process.env.TENDRIL_STATIC_WARN_MISSING) {
                    // Check that the specified directory actually exists.
                    yield future_1.parallel(record_1.mapTo(normalizedConfs, conf => future_1.doFuture(function* () {
                        let yes = yield file_1.isDirectory(conf.dir);
                        if (!yes)
                            console.warn(`${name}: The directory ` +
                                `"${conf.dir}" does not exist!`);
                        main.app.use(express.static(conf.dir, conf.options));
                        return future_1.pure(undefined);
                    })));
                }
                else {
                    record_1.map(normalizedConfs, conf => main.app.use(express.static(conf.dir, conf.options)));
                }
                return future_1.pure(undefined);
            })));
            return future_1.pure(undefined);
        });
    }
}
exports.StaticStage = StaticStage;
const normalizeConf = (conf) => {
    if (Array.isArray(conf)) {
        return conf.reduce((p, c) => {
            let obj = normalize(c);
            return record_1.merge(p, { [obj.dir]: obj });
        }, {});
    }
    else if (type_1.isString(conf)) {
        return { [conf]: { dir: conf } };
    }
    return record_1.map(conf, normalize);
};
const normalize = (conf) => type_1.isObject(conf) ? conf : { dir: conf };
const normalizeDirs = (prefix, confs) => record_1.map(confs, c => path_1.isAbsolute(c.dir) ? c : record_1.merge(c, {
    dir: path_1.resolve(prefix, c.dir)
}));
const getPrefix = (prefix) => type_1.isString(prefix) ? path_1.join(process.cwd(), prefix) : '';
//# sourceMappingURL=static.js.map