import * as template from '../template';
import { App } from '../../';
/**
 * ModulesConf declares the sub-modules to be loaded for a module.
 */
export interface ModulesConf<S extends App> {
    [key: string]: (s: S) => template.Template<S>;
}
