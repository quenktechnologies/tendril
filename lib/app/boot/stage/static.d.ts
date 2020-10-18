import { Future } from '@quenk/noni/lib/control/monad/future';
import { ModuleDatas, ModuleData } from '../../module/data';
import { Stage } from './';
/**
 * DirPath is a path containing the files to serve.
 */
export declare type DirPath = string;
/**
 * StaticConf is the configuration for one or more
 */
export declare type StaticConf = DirPath | StaticConfMap | (DirPath | StaticDirConf)[];
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
export declare class StaticStage implements Stage {
    mainProvider: () => ModuleData;
    modules: ModuleDatas;
    constructor(mainProvider: () => ModuleData, modules: ModuleDatas);
    name: string;
    execute(): Future<void>;
}
