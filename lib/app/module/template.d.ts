import * as T from '@quenk/potoo/lib/actor/template';
import * as server from '../../net/http/server';
import * as app from '../configuration';
import * as connection from '../connection';
import { Context } from '../state/context';
import { Module } from '../module';
import { App } from '../';
/**
 * Connector used to create a connection.
 */
export declare type Connector = (...options: any[]) => connection.Connection;
/**
 * Template for spawning a Module.
 */
export interface Template extends T.Template<Context, App> {
    /**
     * disabled indicates whether the module should be disabled or not.
     */
    disabled?: boolean;
    /**
     * create a Module.
     *
     * Overrides the base function to specifically provide a module.
     */
    create: (s: App) => Module;
    /**
     * server configuration settings.
     */
    server?: server.Configuration;
    /**
     * connections configuration settings.
     */
    connections?: Connections;
    /**
     * app configuration settings.
     */
    app?: app.Configuration;
}
/**
 * Connections section.
 */
export interface Connections {
    [key: string]: Connection;
}
/**
 * Connection
 */
export interface Connection {
    connector: Connector;
    options?: any[];
}
