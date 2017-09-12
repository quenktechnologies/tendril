import * as Bluebird from 'bluebird';
import * as express from 'express';
import * as data from '../data';
import { Module } from './';
import { Renderer } from './Renderer';

/**
 * Conf is the top level conf namespace.
 */
export interface Conf<A> {

    tendril?: {

        server?: ServerConf;
        data?: DataConf<A>;
        app?: AppConf<A>;

    }

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

    connections?: ConnectionsConf<A>

}

/**
 * ConnectionsConf settings for establishing remote connections.
 */
export interface ConnectionsConf<A> {

    [key: string]: ConnectionConf<A>

}

/**
 * ConnectionConf settings for a single connection.
 */
export interface ConnectionConf<A> {

    connector: (options: Options<A>) => Bluebird<data.Connection<A>>
    options?: Options<A>

}

/**
 * AppConf settings for the application.
 */
export interface AppConf<A> {

    modules?: ModulesConf<A>;
    middleware?: MiddlewareConf<A>;
    views?: ViewsConf<A>;
    errors?: ErrorsConf<A>;
    on?: EventsConf<A>

}

/**
 * ModulesConf provides settings for modules.
 */
export interface ModulesConf<C> {

    [key: string]: ModuleConf<C>

}

export interface ModuleConf<C> {

    (name: string): Module<C>

}

/**
 * MiddlewareConf settings for configuring middleware.
 */
export interface MiddlewareConf<A> {

    available?: AvailableMiddlewareConf<A>;
    enabled?: string[]

}

/**
 * AvailableMiddlewareConf that can be used in the enabled section.
 */
export interface AvailableMiddlewareConf<A> {

    [key: string]: {

        module: (options?: A) => express.RequestHandler
        options?: A

    }

}

/**
 * ViewsConf settings for configuring view engines.
 */
export interface ViewsConf<A> {

    engine: {

        module: (options: Options<A>, m: Module<A>) => Bluebird<Renderer>
        options?: Options<A>

    }

}

export interface ErrorsConf<C> {

    handler?: (e: Error, module: Module<C>) => void

}

export interface Hook<C> {

 (m: Module<C>):  Bluebird<void>;

}

export interface EventsConf<C> {

    init?: Hook<C>[];
    connected?: Hook<C>[];

}

/**
 * Options 
 */
export interface Options<A> {

    [key: string]: A

}

