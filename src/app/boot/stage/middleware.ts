import * as express from 'express';

import { Future, pure, raise } from '@quenk/noni/lib/control/monad/future';
import { reduce } from '@quenk/noni/lib/data/record';
import { Either, left, right } from '@quenk/noni/lib/data/either';
import { fromBoolean } from '@quenk/noni/lib/data/maybe';

import { ModuleData, ModuleDatas } from '../../module/data';
import { Middleware } from '../../middleware';
import { App } from '../../';
import { Stage } from './';

/**
 * MiddlewareStage installs the express middleware configured for 
 * each module.
 */
export class MiddlewareStage implements Stage {

    constructor(
      public app: App,
      public modules: ModuleDatas) { }

    name = 'middleware';

    execute(): Future<void> {

        let { app, modules } = this;

        return <Future<void>>reduce(modules, pure(app),
            (p, c) => applyMware(p, c))
            .chain(() => pure(undefined));

    }

}

const applyMware = (app: Future<App>, m: ModuleData): Future<App> =>
    m
        .middleware
        .enabled
        .reduce(swap(m), right([preroute(m)]))
        .map(list => m.app.use.apply(m.app, <any>list))
        .map(() => app)
        .orRight(e => <Future<App>>raise(e))
        .takeRight();

const preroute = (module: ModuleData) =>
    (_: express.Request, res: express.Response, next: express.NextFunction) =>
        fromBoolean(module.disabled)
            .map(() => res.status(404).end())
            .orElse(() => module.redirect.map(r =>
                res.redirect(r.status, r.location)))
            .orJust(() => next());

const swap = (m: ModuleData) => (p: Either<Error, Middleware[]>, c: string)
    : Either<Error, Middleware[]> =>
    m.middleware.available.hasOwnProperty(c) ?
        p
            .map(concatMware(m, c)) :
        m
            .parent
            .map(parent => swap(parent)(p, c))
            .orJust(errMware(m.path, c))
            .get();

const concatMware = (m: ModuleData, key: string) => (list: Middleware[]) =>
    list.concat(m.middleware.available[key])

const errMware = (path: string, key: string) => ()
    : Either<Error, Middleware[]> =>
    left(new Error(`${path}: Unknown middleware "${key}"!`));
