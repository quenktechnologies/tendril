import { Future } from '@quenk/noni/lib/control/monad/future';
import { App } from './';
/**
 * Dispatcher is used by the main App to dispatch hook events.
 *
 * Hooks are dispatched in parallel at the module level but at the
 * hook level the are executed sequentially.
 */
export declare class Dispatcher<S extends App> {
    app: S;
    constructor(app: S);
    /**
     * init fires all the "init" hooks for all the installed modules.
     */
    init(): Future<void>;
    /**
     * connected fires all the "connected" hooks when all services have been
     * connected.
     */
    connected(): Future<void>;
    /**
     * stared fires the "started" hooks when the app has started servicing
     * requests.
     */
    started(): Future<void>;
}
