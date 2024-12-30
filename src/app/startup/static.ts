import * as express from 'express';

import { isAbsolute, resolve, join } from 'path';

import { Record, map, merge } from '@quenk/noni/lib/data/record';
import { isObject, isString } from '@quenk/noni/lib/data/type';
import { isDirectory, Path } from '@quenk/noni/lib/io/file';

import { ModuleInfo } from '../module';
import { StaticConf, StaticDirConf } from '../conf';
import { BaseStartupTask } from '.';


interface FlatStaticConfMap {
    [key: string]: StaticDirConf;
}

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
export class StaticStage extends BaseStartupTask {
    constructor(
        public mainProvider: () => ModuleInfo,
    ) { super(); }

    name = 'static';

    async onConfigureModule(mod:ModuleInfo) {
        let { mainProvider, name } = this;

        let main = mainProvider();

            let prefix = '';

            let mconfs: FlatStaticConfMap = { public: { dir: 'public' } };

            if (mod.conf) {
                let dirs = (mod.conf.app && mod.conf.app.dirs) || {};

                prefix = getPrefix(dirs.self);

                mconfs = merge(
                    mconfs,
                    normalizeConf(dirs.public || {})
                );
            }

            let normalizedConfs = normalizeDirs(prefix, mconfs);

            if (process.env.TENDRIL_STATIC_WARN_MISSING) {
                // Check that the specified directory actually exists.

                for (let conf of Object.values(normalizedConfs)) {
                    let yes = await isDirectory(conf.dir);

                    if (!yes)
                        console.warn(
                            `${name}: The directory ` +
                                `"${conf.dir}" does not exist!`
                        );

                    main.express.use(express.static(conf.dir, conf.options));
                }
            } else {
                map(normalizedConfs, conf =>
                    main.express.use(express.static(conf.dir, conf.options))
                );
            }
        }
    }

const normalizeConf = (conf: StaticConf={}): FlatStaticConfMap => {
    if (Array.isArray(conf)) {
        return conf.reduce(
            (p: FlatStaticConfMap, c) => {
                let obj = normalize(c);
                return merge(p, { [obj.dir]: obj });
            },
            <FlatStaticConfMap>{}
        );
    } else if (isString(conf)) {
        return { [conf]: { dir: conf } };
    }

    return map(<Record<string>>conf, normalize);
};

const normalize = (conf: Path | StaticDirConf): StaticDirConf =>
    isObject(conf) ? conf : { dir: conf };

const normalizeDirs = (
    prefix: string,
    confs: FlatStaticConfMap
): FlatStaticConfMap =>
    map(confs, c =>
        isAbsolute(c.dir)
            ? c
            : merge(c, {
                  dir: resolve(prefix, c.dir)
              })
    );

const getPrefix = (prefix?: string) =>
    isString(prefix) ? join(process.cwd(), prefix) : '';
