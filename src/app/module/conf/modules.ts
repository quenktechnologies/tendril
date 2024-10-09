import * as template from '../template';
import { App } from '../../';

/**
 * ModulesConf declares the sub-modules to be loaded for a module.
 */
export interface ModulesConf {
    [key: string]: (app: App) => template.Template;
}
