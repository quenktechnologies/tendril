import * as express from 'express';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Future } from '@quenk/noni/lib/control/monad/future';
import { PVM } from '@quenk/potoo/lib/actor/system/vm';
import { System } from '@quenk/potoo/lib/actor/system';
import { Instance } from '@quenk/potoo/lib/actor';
import { Template as PotooTemplate } from '@quenk/potoo/lib/actor/template';
import { Address } from '@quenk/potoo/lib/actor/address';
import { PTValue } from '@quenk/potoo/lib/actor/system/vm/type';
import { Script } from '@quenk/potoo/lib/actor/system/vm/script';
import { Server } from '../net/http/server';
import { Template } from './module/template';
import { ModuleData, ModuleDatas } from './module/data';
import { StageBundle } from './boot/stage';
import { Dispatcher } from './hooks';
/**
 * App is the main entry point to the framework.
 *
 * An App serves as an actor system for all the modules of the application.
 * It configures routing of requests for each module and makes whatever services
 * the user desires available via child actors.
 */
export declare class App implements System {
    provider: (s: App) => Template<App>;
    constructor(provider: (s: App) => Template<App>);
    main: Template<App>;
    vm: PVM<this>;
    modules: ModuleDatas;
    server: Server;
    pool: import("./connection").Pool;
    hooks: Dispatcher<this>;
    stages: StageBundle;
    /**
     * create a new Application instance.
     */
    static create(provider: (s: App) => Template<App>): App;
    /**
     * createDefaultStageBundle produces a StageBundle
     */
    static createDefaultStageBundle(app: App): StageBundle;
    exec(i: Instance, s: Script): void;
    execNow(i: Instance, s: Script): Maybe<PTValue>;
    /**
     * spawn a regular actor from a template.
     *
     * This actor must use the same Context type as the App.
     */
    spawn(tmpl: PotooTemplate<this>): App;
    /**
     * spawnModule (not a generic actor) from a template.
     *
     * A module must have a parent unless it is the root module of the app.
     */
    spawnModule(path: string, parent: Maybe<ModuleData>, tmpl: Template<App>): Future<Address>;
    /**
     * installMiddleware at the specified mount point.
     *
     * If no module exists there, the attempt will be ignored.
     */
    installMiddleware(path: string, handler: express.RequestHandler): App;
    /**
     * start the App.
     */
    start(): Future<App>;
    stop(): Future<void>;
}
