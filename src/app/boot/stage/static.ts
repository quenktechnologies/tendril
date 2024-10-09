import * as express from 'express';

import { isAbsolute, resolve, join } from 'path';

import { Record, map, merge } from '@quenk/noni/lib/data/record';
import { isObject, isString } from '@quenk/noni/lib/data/type';
import { isDirectory } from '@quenk/noni/lib/io/file';

import { ModuleDatas, ModuleData } from '../../module/data';
import { Stage } from './';

/**
 * DirPath is a path containing the files to serve.
 */
export type DirPath = string;

/**
 * StaticConf is the configuration for one or more
 */
export type StaticConf = DirPath | StaticConfMap | (DirPath | StaticDirConf)[];

/**
 * StaticDirConf is the configuration for a single static directory.
 */
export interface StaticDirConf {
    /**
     * dir path to serve.
     */
    dir: DirPath;

    /**
     * options passed directly to the serve-static middleware.
     */
    options?: object;
}

/**
 * StaticConfMap configures zero or more directories to be served as static
 * files.
 */
export interface StaticConfMap {
    [key: string]: DirPath | StaticDirConf;
}

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
export class StaticStage implements Stage {
    constructor(
        public mainProvider: () => ModuleData,
        public modules: ModuleDatas
    ) {}

    name = 'static';

    async execute() {
        let { mainProvider, modules, name } = this;

        let main = mainProvider();

        for (let m of Object.values(modules)) {
            let prefix = '';

            let mconfs: FlatStaticConfMap = { public: { dir: 'public' } };

            if (m.template) {
                let dirs = (m.template.app && m.template.app.dirs) || {};

                prefix = getPrefix(dirs.self);

                mconfs = merge(
                    mconfs,
                    normalizeConf(<StaticConf>dirs.public || {})
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

                    main.app.use(express.static(conf.dir, conf.options));
                }
            } else {
                map(normalizedConfs, conf =>
                    main.app.use(express.static(conf.dir, conf.options))
                );
            }
        }
    }
}

const normalizeConf = (conf: StaticConf): FlatStaticConfMap => {
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

const normalize = (conf: DirPath | StaticDirConf): StaticDirConf =>
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
