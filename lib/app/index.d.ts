import * as Bluebird from 'bluebird';
import * as express from 'express';
import * as conf from './Conf';
import { ManagedServer } from '../server';
import { Renderer } from './Renderer';
export declare class DefaultRenderer {
    name: string;
    constructor(name: string);
    render(): Bluebird<string>;
}
export interface RouteFn<C> {
    (app: express.Application, renderer: Renderer, module: Module<C>): void;
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
/**
 * Application is the main class of the framework.
 */
export declare class Application<C> {
    main: Module<C>;
    express: express.Application;
    server: ManagedServer;
    constructor(main: Module<C>);
    start(): Bluebird<Application<C>>;
}
