import * as express from 'express';
import * as mware from './middleware';
import * as config from '@quenk/potoo/lib/actor/system/configuration';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { State } from '@quenk/potoo/lib/actor/system/state';
import { Envelope } from '@quenk/potoo/lib/actor/mailbox';
import { System } from '@quenk/potoo/lib/actor/system';
import { Actor } from '@quenk/potoo/lib/actor';
import { Template as PotooTemplate } from '@quenk/potoo/lib/actor/template';
import { Address } from '@quenk/potoo/lib/actor/address';
import { Executor, Op } from '@quenk/potoo/lib/actor/system/op';
import { Server } from '../net/http/server';
import { Pool } from './connection';
import { Template } from './module/template';
import { Context } from './state/context';
/**
 * App is the main class of the framework.
 *
 * This class functions as an actor system and your
 * application.
 */
export declare class App implements System<Context>, Executor<Context> {
    main: Template;
    configuration: config.Configuration;
    constructor(main: Template, configuration: config.Configuration);
    state: State<Context>;
    stack: Op<Context>[];
    running: boolean;
    express: express.Application;
    server: Server;
    pool: Pool;
    middleware: {
        [key: string]: mware.Middleware;
    };
    paths: string[];
    initialize(): Future<App>;
    connections(): Future<App>;
    middlewares(): Future<App>;
    routing(): Future<App>;
    linking(): Future<App>;
    spawn(path: string, tmpl: Template): App;
    allocate(t: PotooTemplate<Context>): Context;
    init(c: Context): Context;
    identify(actor: Actor<Context>): Address;
    exec(code: Op<Context>): App;
    accept({ to, from, message }: Envelope): App;
    run(): void;
    start(): Future<App>;
    stop(): Future<void>;
}
