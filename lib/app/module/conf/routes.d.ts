import { RouteConf, Module } from '../';
/**
 * Routes function is used to install application routes.
 */
export declare type Routes = <A>(m: Module) => RouteConf<A>[];
