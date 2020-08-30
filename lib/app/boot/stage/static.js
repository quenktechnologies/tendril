"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticStage = void 0;
const express = require("express");
const path_1 = require("path");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const record_1 = require("@quenk/noni/lib/data/record");
const type_1 = require("@quenk/noni/lib/data/type");
/**
 * StaticStage configures middleware for serving static files for each module.
 *
 * All configured dirs are served as one virtual directory.
 * The configuration of static paths can be a [[StaticDirConf]] or a string
 * for a single path. Multiple paths can be configured by using an array of
 * strings or StaticDirConfs or a map of StaticDirConfs.
 *
 * They will all be expanded to a StaticDirConf before installed.
 * By default, any folder named "public" in a module will be served.
 *
 * Note: If "app.dirs.self" is configured, all static paths will be relative
 * to its value. This is usually the path to the module on the filesystem.
 */
class StaticStage {
    constructor(mainProvider, modules) {
        this.mainProvider = mainProvider;
        this.modules = modules;
        this.name = 'static';
    }
    execute() {
        let { mainProvider, modules } = this;
        let main = mainProvider();
        return future_1.fromCallback(cb => {
            record_1.map(modules, m => {
                let mconfs = { 'public': { dir: 'public' } };
                let prefix = '';
                if (m.template) {
                    let dirs = m.template.app && m.template.app.dirs || {};
                    prefix = getPrefix(dirs.self);
                    mconfs = record_1.merge(mconfs, normalizeConf(dirs.public || {}));
                }
                record_1.map(normalizeDirs(prefix, mconfs), c => main.app.use(express.static(c.dir, c.options)));
            });
            cb(null);
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