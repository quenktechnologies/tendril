import { fromNullable } from '@quenk/noni/lib/data/maybe';
import { map, values } from '@quenk/noni/lib/data/record';
import { noop } from '@quenk/noni/lib/data/function';
import {
    Future,
    pure,
    parallel,
    sequential,
} from '@quenk/noni/lib/control/monad/future';
import { Context } from './actor/context';
import { App } from './';

/**
 * Dispatcher is used by the main App to dispatch hook events.
 *
 * Hooks are dispatched in parallel at the module level but at the 
 * hook level the are executed sequentially.
 */
export class Dispatcher<S extends App>  {

    constructor(public app: S) { }

    /**
     * init fires all the "init" hooks for all the installed modules.
     */
    init(): Future<void> {

        let { app } = this;

        return parallel(values<Future<void>>(map(app.state.contexts,
            (c: Context) => {

                if (c.module.isJust()) {

                    let m = c.module.get();

                    let mHooks = fromNullable(m.hooks.init);

                    if (mHooks.isNothing()) return pure(<void>undefined);

                    let hooks = mHooks.get();

                    return Array.isArray(hooks) ?
                        sequential(hooks.map(f => f(app)))
                            .map(noop) :
                        hooks(app);

                } else {

                    return pure(<void>undefined);

                }

            })))
            .map(noop);

    }

    /**
     * connected fires all the "connected" hooks when all services have been
     * connected.
     */
    connected(): Future<void> {

        let { app } = this;

        return parallel(values(map(app.state.contexts,
            (c: Context) => {

                if (c.module.isJust()) {

                    let m = c.module.get();

                    let mHooks = fromNullable(m.hooks.connected);

                    if (mHooks.isNothing()) return pure(<void>undefined);

                    let hooks = mHooks.get();

                    return (Array.isArray(hooks)) ?
                        sequential(hooks.map(f => f(app)))
                            .map(() => { }) :
                        hooks(app);

                } else {

                    return pure(<void>undefined);

                }

            })))
            .map(noop);

    }

    /**
     * stared fires the "started" hooks when the app has started servicing
     * requests.
     */
    started(): Future<void> {

        let { app } = this;

        return parallel(values(map(app.state.contexts,
            (c: Context) => {

                if (c.module.isJust()) {

                    let m = c.module.get();

                    let mHooks = fromNullable(m.hooks.started);

                    if (mHooks.isNothing()) return pure(<void>undefined);

                    let hooks = mHooks.get();

                    return Array.isArray(hooks) ?
                        sequential(hooks.map(f => f(app)))
                            .map(() => { }) :
                        hooks(app);

                } else {

                    return pure(<void>undefined);

                }

            })))
            .map(noop);

    }

}
