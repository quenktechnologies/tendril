import * as express from 'express';
import * as config from '@quenk/potoo/lib/actor/system/configuration';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { State } from '@quenk/potoo/lib/actor/system/state';
import { Message } from '@quenk/potoo/lib/actor/message';
import { AbstractSystem } from '@quenk/potoo/lib/actor/system/abstract';
import { System } from '@quenk/potoo/lib/actor/system';
import { Template as PotooTemplate } from '@quenk/potoo/lib/actor/template';
import { Address } from '@quenk/potoo/lib/actor/address';
import { Op } from '@quenk/potoo/lib/actor/system/op';
import { Server } from '../net/http/server';
import { Pool } from './connection';
import { Template } from './module/template';
import { Context, Module as ModuleContext } from './state/context';
/**
 * App is the main class of the framework.
 *
 * This class functions as an actor system and your
 * application.
 */
export declare class App extends AbstractSystem<Context> implements System<Context> {
    main: Template;
    configuration: config.Configuration;
    constructor(main: Template, configuration?: config.Configuration);
    state: State<Context>;
    stack: Op<Context, App>[];
    running: boolean;
    server: Server;
    pool: Pool;
    allocate(t: PotooTemplate<Context, App>): Context;
    /**
     * tell a message to an actor in the system.
     */
    tell(to: Address, msg: Message): App;
    /**
     * spawn a regular actor from a template.
     *
     * This actor must use the same Context type as the App.
     */
    spawn(tmpl: PotooTemplate<Context, App>): App;
    /**
     * spawnModule (not a generic actor) from a template.
     *
     * A module may or may not have a parent. In the case of the latter the
     * module should be the root module of tha App.
     */
    spawnModule(path: string, parent: Maybe<ModuleContext>, tmpl: Template): App;
    /**
     * installMiddleware at the specified mount point.
     *
     * If no module exists there, the attempt will be ignored.
     */
    installMiddleware(path: string, handler: express.RequestHandler): App;
    /**
     * initialize the App
     *
     * Invokes the init hooks of all modules.
     */
    initialize(): Future<App>;
    /**
     * connections opens all the connections the modules of the App have
     * declared.
     *
     * Connections are open in parallel, any failing will prevent the whole
     * application from booting.
     */
    connections(): Future<App>;
    /**
     * middlewares installs the middleware each module declares.
     */
    middlewares(): Future<App>;
    /**
     * routing installs all the routes of each module and creates a tree
     * out of express.
     */
    routing(): Future<App>;
    /**
     * listen for incomming connections.
     */
    listen(): Future<Server>;
    /**
     * start the App.
     */
    start(): Future<App>;
    stop(): Future<void>;
}
