import * as express from 'express';

import { reduce } from '@quenk/noni/lib/data/record';
import { Either, left, right } from '@quenk/noni/lib/data/either';
import { Maybe, fromNullable } from '@quenk/noni/lib/data/maybe';

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
        public modules: ModuleDatas
    ) {}

    name = 'middleware';

    async execute() {
        let { modules } = this;

        let init: Either<Error, void> = right(undefined);

        let result = reduce(modules, init, (prev, mData) => {
            if (prev.isLeft()) return prev;

            let exApp = mData.app;

            exApp.use(beforeMiddleware(mData));

            let emwares = getMiddlewareByNames(mData, mData.middleware.enabled);

            if (emwares.isLeft()) return left(emwares.takeLeft());

            emwares.takeRight().forEach(mware => exApp.use(mware));

            return prev;
        });

        if (result.isLeft()) throw <Error>result.takeLeft();
    }
}

// Ensures disabled and redirecting Modules are respected.
const beforeMiddleware =
    (mData: ModuleData) =>
    (_: express.Request, res: express.Response, next: express.NextFunction) => {
        if (mData.disabled === true) {
            // TODO: hook into app 404 handling
            res.sendStatus(404);
        } else if (mData.redirect.isJust()) {
            let r = mData.redirect.get();
            res.redirect(r.status, r.location);
        } else {
            next();
        }
    };

const getMiddlewareByNames = (
    mData: ModuleData,
    names: string[]
): Either<Error, Middleware[]> => {
    let results = names.map(name => getMiddlewareByName(mData, name));

    let allFound = results.map(r => r.isJust());

    if (allFound) return right(results.map(r => r.get()));

    let missing = results.map((r, idx) => (r.isNothing() ? names[idx] : ''));

    return left(
        namesNotFoundErr(
            mData.path,
            missing.filter(name => name)
        )
    );
};

// TODO: Migrate to App. See issue #45
const getMiddlewareByName = (
    mData: ModuleData,
    name: string
): Maybe<Middleware> => {
    let result = fromNullable(mData.middleware.available[name]);

    if (result.isJust()) return result;
    else if (mData.parent.isJust())
        return getMiddlewareByName(mData.parent.get(), name);
    else return result;
};

const namesNotFoundErr = (path: string, names: string[]) =>
    new Error(
        `${path}: The following middleware could not be found: ` +
            `${names.join()}!`
    );
