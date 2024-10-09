import { fromNullable } from '@quenk/noni/lib/data/maybe';
import { map, values } from '@quenk/noni/lib/data/record';
import { noop } from '@quenk/noni/lib/data/function';
import {
    Future,
    pure,
    parallel,
    sequential
} from '@quenk/noni/lib/control/monad/future';

import { ModuleData } from './module/data';
import { App } from './';

/**
 * Dispatcher is used by the main App to dispatch hook events.
 *
 * Hooks are dispatched in parallel at the app level but sequentially
 * at the module level.
 */
export class Dispatcher<S extends App> {
    constructor(public app: S) {}

    /**
     * init fires the "init" hook.
     */
    init(): Future<void> {
        let { app } = this;

        return parallel(
            values<Future<void>>(
                map(app.modules, (m: ModuleData) => {
                    let mHooks = fromNullable(m.hooks.init);

                    if (mHooks.isNothing()) return pure(<void>undefined);

                    let hooks = mHooks.get();

                    return Array.isArray(hooks)
                        ? sequential(hooks.map(f => f(app))).map(noop)
                        : hooks(app);
                })
            )
        ).map(noop);
    }

    /**
     * connected fires all the "connected" hook when all remote connections
     * have been established.
     */
    connected(): Future<void> {
        let { app } = this;

        return parallel(
            values(
                map(app.modules, (m: ModuleData) => {
                    let mHooks = fromNullable(m.hooks.connected);

                    if (mHooks.isNothing()) return pure(<void>undefined);

                    let hooks = mHooks.get();

                    return Array.isArray(hooks)
                        ? sequential(hooks.map(f => f(app))).map(() => {})
                        : hooks(app);
                })
            )
        ).map(noop);
    }

    /**
     * stared fires the "started" hook when the app has started listening
     * for requests.
     */
    started(): Future<void> {
        let { app } = this;

        return parallel(
            values(
                map(app.modules, (m: ModuleData) => {
                    let mHooks = fromNullable(m.hooks.started);

                    if (mHooks.isNothing()) return pure(<void>undefined);

                    let hooks = mHooks.get();

                    return Array.isArray(hooks)
                        ? sequential(hooks.map(f => f(app))).map(() => {})
                        : hooks(app);
                })
            )
        ).map(noop);
    }
}
