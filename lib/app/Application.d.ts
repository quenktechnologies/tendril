import * as Bluebird from 'bluebird';
import * as express from 'express';
import { ManagedServer } from '../server';
import { Module } from './Module';
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
