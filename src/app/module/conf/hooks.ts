import * as filters from '../../api/request';

import { Future } from '@quenk/noni/lib/control/monad/future';

import { App } from '../../';

/**
 * Init function type.
 */
export type Init = (app: App) => Future<void>;

/**
 * Connected function type.
 */
export type Connected = (app: App) => Future<void>;

/**
 * Start function type.
 */
export type Start = (app: App) => Future<void>;

/**
 * HookConf is used to configure handlers for events at various stages
 * of boot up.
 */
export interface HookConf {
    /**
     * init is invoked before the application is configured.
     */
    init?: Init | Init[];

    /**
     * connected is invoked when all connections have been established.
     */
    connected?: Connected | Connected[];

    /**
     * started is invoked when the application is ready to serve requests.
     */
    started?: Start | Start[];

    /**
     * error is invoked when an error occurs during boot.
     */
    error?: (e: Error) => Future<void>;

    /**
     * notFound is invoked when the configured module finds no routes to execute
     * for a request.
     */
    notFound?: filters.Filter<void>;

    /**
     * internalError is invoked when an error occurs while handling a request
     * for a configured module.
     */
    internalError?: filters.ErrorFilter;
}
