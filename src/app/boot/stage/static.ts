import * as express from 'express';

import { isAbsolute, resolve } from 'path';

import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { Record, map, merge } from '@quenk/noni/lib/data/record';
import { isObject, isString } from '@quenk/noni/lib/data/type';

import { ModuleDatas, ModuleData } from '../../module/data';
import { Stage } from './';

/**
 * DirPath is a path containing the files to serve.
 */
export type DirPath = string;

/**
 * StaticConf is the configuration for one or more
 */
export type StaticConf
    = DirPath
    | StaticConfMap
    | (DirPath | StaticDirConf)[]
    ;

/**
 * StaticDirConf is the configuration for a single static directory.
 */
export interface StaticDirConf {

    /**
     * dir path to serve.
     */
    dir: DirPath,

    /**
     * options passed directly to the serve-static middleware.
     */
    options?: object

}

/**
 * StaticConfMap configures zero or more directories to be served as static
 * files.
 */
export interface StaticConfMap {

    [key: string]: DirPath | StaticDirConf

}

interface FlatStaticConfMap {

    [key: string]: StaticDirConf

}

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
export class StaticStage implements Stage {

    constructor(
        public mainProvider: () => ModuleData,
        public modules: ModuleDatas) { }

    name = 'static';

    execute(): Future<void> {

        let { mainProvider, modules } = this;
        let main = mainProvider();

        map(modules, m => {

            let mconfs: FlatStaticConfMap = { 'public': { dir: 'public' } };
            let prefix = '';


            if (m.template &&
                m.template.app &&
                m.template.app.dirs &&
                m.template.app.dirs.public) {

                let { dirs } = m.template.app;

                prefix = isString(dirs.self) ? dirs.self : prefix;
                mconfs = merge(mconfs, normalizeConf(<StaticConf>dirs.public));

            }

            map(normalizeDirs(prefix, mconfs), c =>
                main.app.use(express.static(c.dir, c.options)));

        });

        return pure(<void>undefined);
    }
}

const normalizeConf = (conf: StaticConf): FlatStaticConfMap => {

    if (Array.isArray(conf)) {

        return conf.reduce((p: FlatStaticConfMap, c) => {

            let obj = normalize(c);
            return merge(p, { [obj.dir]: obj });

        }, <FlatStaticConfMap>{});

    } else if (isString(conf)) {

        return { [conf]: { dir: conf } };

    }

    return map(<Record<string>>conf, normalize);

}

const normalize = (conf: DirPath | StaticDirConf): StaticDirConf =>
    isObject(conf) ? conf : { dir: conf };

const normalizeDirs =
    (prefix: string, confs: FlatStaticConfMap): FlatStaticConfMap =>
        map(confs, c => isAbsolute(c.dir) ? c : merge(c, {
            dir: resolve(prefix, c.dir)
        }));
