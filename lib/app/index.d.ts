import * as express from 'express';
import * as config from '@quenk/potoo/lib/actor/system/configuration';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { State } from '@quenk/potoo/lib/actor/system/state';
import { Message } from '@quenk/potoo/lib/actor/message';
import { AbstractSystem } from '@quenk/potoo/lib/actor/system/framework';
import { Runtime } from '@quenk/potoo/lib/actor/system/vm/runtime';
import { System } from '@quenk/potoo/lib/actor/system';
import { Actor } from '@quenk/potoo/lib/actor';
import { Template as PotooTemplate } from '@quenk/potoo/lib/actor/template';
import { Address } from '@quenk/potoo/lib/actor/address';
import { Server } from '../net/http/server';
import { Pool } from './connection';
import { Template } from './module/template';
import { Context, ModuleData } from './actor/context';
import { Dispatcher } from './hooks';
/**
 * App is the main entry point to the framework.
 *
 * An App serves as an actor system for all the modules of the application.
 * It configures routing of requests for each module and makes whatever services
 * the user desires available via child actors.
 */
export declare class App extends AbstractSystem implements System {
    provider: (s: App) => Template<App>;
    constructor(provider: (s: App) => Template<App>);
    state: State<Context>;
    main: Template<App>;
    configuration: config.Configuration;
    server: Server;
    pool: Pool;
    hooks: Dispatcher<this>;
    init(c: Context): Context;
    allocate(a: Actor<Context>, r: Runtime, t: PotooTemplate<App>): Context;
    /**
     * tell a message to an actor in the system.
     */
    tell(to: Address, msg: Message): App;
    /**
     * spawn a regular actor from a template.
     *
     * This actor must use the same Context type as the App.
     */
    spawn(tmpl: PotooTemplate<App>): App;
    /**
     * spawnModule (not a generic actor) from a template.
     *
     * A module must have a parent unless it is the root module of the app.
     */
    spawnModule(path: string, parent: Maybe<ModuleData>, tmpl: Template<App>): App;
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
    listen(): Future<void>;
    /**
     * start the App.
     */
    start(): Future<App>;
    stop(): Future<void>;
}
