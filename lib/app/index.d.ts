import * as Bluebird from 'bluebird';
import * as express from 'express';
import * as data from '../data';
import { ManagedServer } from '../server';
import { Renderer } from './Renderer';
/**
 * Conf is the top level conf namespace.
 */
export interface Conf<A> {
    tendril?: {
        server?: ServerConf;
        data?: DataConf<A>;
        app?: AppConf<A>;
    };
}
/**
 * ServerConf settings for the http server.
 */
export interface ServerConf {
    port?: string;
    host?: string;
}
/**
 * DataConf settings for establishing remote connections
 */
export interface DataConf<A> {
    connections?: Connections<A>;
}
/**
 * Connections settings for establishing remote connections.
 */
export interface Connections<A> {
    [key: string]: Connection<A>;
}
/**
 * Configuration settings for a single connection.
 */
export interface Connection<A> {
    connector: (options: Options<A>) => Bluebird<data.Connection>;
    options?: Options<A>;
}
/**
 * AppConf settings for the application.
 */
export interface AppConf<A> {
    modules?: ModulesConf<A>;
    filters?: FiltersConf<A>;
    views?: ViewsConf<A>;
    errors?: ErrorsConf<A>;
}
/**
 * ModulesConf provides settings for modules.
 */
export interface ModulesConf<C> {
    [key: string]: ModuleConf<C>;
}
export interface ModuleConf<C> {
    (name: string): Module<C>;
}
/**
 * FiltersConf settings for configuring middleware.
 */
export interface FiltersConf<A> {
    available?: AvailableFiltersConf<A>;
    enabled?: string[];
}
/**
 * AvailableFiltersConf that can be used in the enabled section.
 */
export interface AvailableFiltersConf<A> {
    [key: string]: FilterConf<A>;
}
/**
 * Filter settings for one one middleware.
 */
export interface FilterConf<A> {
    module: (options?: Options<A>) => express.RequestHandler;
    options?: Options<A>;
}
/**
 * ViewsConf settings for configuring view engines.
 */
export interface ViewsConf<A> {
    engine: {
        module: (options: Options<A>) => Bluebird<Renderer>;
        options?: Options<A>;
    };
}
export interface ErrorsConf<C> {
    handler?: (e: Error, req: express.Request, res: express.Response, module: Module<C>) => void;
}
/**
 * Options
 */
export interface Options<A> {
    [key: string]: A;
}
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
    configuration: Conf<C>;
    routeFn: RouteFn<C>;
    _modules: Module<C>[];
    _application: Application<C>;
    _app: express.Application;
    _renderer: Renderer;
    constructor(name: string, configuration: Conf<C>, routeFn: RouteFn<C>);
    getApp(): Application<C>;
    getExpressApp(): express.Application;
    getConf(): Conf<C>;
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
