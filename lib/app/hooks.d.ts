import { Future } from '@quenk/noni/lib/control/monad/future';
import { App } from './';
/**
 * Dispatcher is used by the main App to dispatch hook events.
 *
 * Hooks are dispatched in parallel at the app level but sequentially
 * at the module level.
 */
export declare class Dispatcher<S extends App> {
    app: S;
    constructor(app: S);
    /**
     * init fires the "init" hook.
     */
    init(): Future<void>;
    /**
     * connected fires all the "connected" hook when all remote connections
     * have been established.
     */
    connected(): Future<void>;
    /**
     * stared fires the "started" hook when the app has started listening
     * for requests.
     */
    started(): Future<void>;
}
