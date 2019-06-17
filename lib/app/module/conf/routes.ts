import { RouteConf, Module } from '../';

/**
 * Routes function is used to install application routes.
 */
export type Routes = <A>(m: Module) => RouteConf<A>[];
