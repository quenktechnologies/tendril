import * as T from '@quenk/potoo/lib/actor/template';
import * as server from '../../net/http/server';
import * as app from '../configuration';
import * as connection from '../connection';
import { Type } from '@quenk/noni/lib/data/type';
import { Context } from '@quenk/potoo/lib/actor/context';
import { Actor } from '@quenk/potoo/lib/actor';
import { Module } from '../module';
import { App } from '../';
/**
 * Connector used to create a system managed connection.
 */
export declare type Connector = (...options: Type[]) => connection.Connection;
/**
 * Constructor of a new actor instance.
 */
export interface Constructor {
    new (...args: Type[]): Actor<Context>;
}
/**
 * Template for spawning a Module.
 */
export interface Template<S extends App> extends T.Template<S> {
    /**
     * disabled indicates whether the module should be disabled or not.
     */
    disabled?: boolean;
    /**
     * create a Module.
     *
     * Overrides the base function to specifically provide a module.
     */
    create: (s: S) => Module;
    /**
     * spawn child actors using the declerative API.
     *
     * The ids of these actors are computed from their key values.
     */
    spawn?: Spawnables;
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
    app?: app.Configuration<S>;
}
/**
 * Connections declares a map of Connections to establish.
 */
export interface Connections {
    [key: string]: Connection;
}
/**
 * Connection declares the configuration for a remote service connections.
 */
export interface Connection {
    /**
     * connector used.
     */
    connector: Connector;
    /**
     * options (if any).
     */
    options?: Type[];
}
/**
 * Spawnables declares a map of Spawnable templates.
 */
export interface Spawnables {
    [key: string]: Spawnable;
}
/**
 * Spawnable is a declartive alternative for specifying child actors.
 *
 * This method of specifying child actors is unsafe and care must be taken
 * to ensure the "args" property matches the arguments the constructor for
 * the actor accepts.
 */
export interface Spawnable {
    /**
     * constructor is used to instantiate an instance of the actor.
     */
    constructor: Constructor;
    /**
     * arguments passed to the constructor.
     *
     * Note that the first parameter must be the system instance.
     */
    arguments: Type[];
}
