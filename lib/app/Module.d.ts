import * as Bluebird from 'bluebird';
import * as express from 'express';
import * as conf from './Conf';
import { Renderer, View } from './Renderer';
import { Application } from './Application';
export interface RouteFn<C> {
    (expressApp: express.Application, m: Module<C>): void;
}
/**
 * Module
 */
export declare class Module<C> {
    name: string;
    configuration: conf.Conf<C>;
    routeFn: RouteFn<C>;
    _modules: Module<C>[];
    _application: Application<C>;
    _app: express.Application;
    _renderer: Renderer;
    constructor(name: string, configuration: conf.Conf<C>, routeFn: RouteFn<C>);
    getApp(): Application<C>;
    getExpressApp(): express.Application;
    getConf(): conf.Conf<C>;
    onError(e: Error, req: express.Request, res: express.Response): void;
    render<A>(view: string, context?: A): Bluebird<View>;
    submodules(): Bluebird<void>;
    connections(): Bluebird<void>;
    middleware(): Bluebird<void>;
    routes(): Bluebird<void>;
    views(): Bluebird<void>;
    link(app: express.Application): Bluebird<void>;
    /**
      * init this module
      */
    init(a: Application<C>): Bluebird<Module<C>>;
}
