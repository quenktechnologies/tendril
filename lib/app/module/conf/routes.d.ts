import { Type } from '@quenk/noni/lib/data/type';
import { RouteConf, Module } from '../';
/**
 * Routes function is used to install application routes.
 */
export declare type Routes = (m: Module) => RouteConf<Type>[];
