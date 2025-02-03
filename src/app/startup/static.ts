import * as express from 'express';

import { join, isAbsolute } from 'node:path';

import { map } from '@quenk/noni/lib/data/record';
import { isString } from '@quenk/noni/lib/data/type';

import { ModuleInfo } from '../module';
import { BaseStartupTask } from '.';

/**
 * StaticDirSupport configures the serving of local folders as static
 * directories.
 *
 * Each module has one virtual static directory in which users can specify sub
 * directories to serve files from. The path '/' itself represents the root
 * directory.
 *
 * Currently the path to the local source directory is always resolved from the
 * CWD of the process (unless an absolute path is provided). It is a lot less
 * chaotic to therefore use absolute paths.
 *
 * A static directory configuration may look something like the following:
 *
 * // <path> : <source>
 * app.routing.dirs:  {
 *  '/': '/path/to/files',
 *  '/js': { path: '/path/to/js', options: {} },
 *  '/css': [{ path: '/path/to/css'}, { path: '/path/to/css2'}]
 * }
 *
 * which will honour requests for files at the '/', '/js' and '/css' paths
 * respectively. The options object is passed directly to the express.static
 * middleware and is optional. The source for a mapping can be a string
 * specifying the local path, an object with path and options, or an array
 * combining the two.
 */
export class StaticDirSupport extends BaseStartupTask {
    name = 'static-dir-support';

    async execute(mod: ModuleInfo) {
        mod.routing.dirs = map(mod.conf?.app?.routing?.dirs ?? {}, conf => {
            let confs = Array.isArray(conf) ? conf : [conf];
            return confs.map(conf => {
                conf = isString(conf) ? { path: conf } : conf;
                return isAbsolute(conf.path)
                    ? conf
                    : { ...conf, path: join(process.cwd(), conf.path) };
            });
        });

        for (let [prefix, dirs] of Object.entries(mod.routing.dirs)) {
            for (let dir of dirs) {
                // TODO: Use middieware stage to install.
                mod.express.use(prefix, express.static(dir.path, dir.options));
            }
        }
    }
}
