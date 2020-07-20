import * as filters from '../../api/request';

import { Future } from '@quenk/noni/lib/control/monad/future';

import { App } from '../../';

/**
 * Init function type.
 */
export type Init<S extends App> = (app: S) => Future<void>;

/**
 * Connected function type.
 */
export type Connected<S extends App> = (app: S) => Future<void>;

/**
 * Start function type.
 */
export type Start<S extends App> = (app: S) => Future<void>;

/**
 * HookConf is used to configure handlers for events at various stages
 * of boot up.
 */
export interface HookConf<S extends App> {

    /**
     * init is invoked before the application is configured.
     */
    init?: Init<S> | Init<S>[],

    /**
     * connected is invoked when all connections have been established.
     */
    connected?: Connected<S> | Connected<S>[],

    /**
     * started is invoked when the application is ready to serve requests.
     */
    started?: Start<S> | Start<S>[],

    /**
     * error is invoked when an error occurs during boot.
     */
  error?: (e:Error) => Future<void>

    /**
     * notFound is invoked when the configured module finds no routes to execute
     * for a request.
     */
    notFound?: filters.Filter<void>,

    /**
     * internalError is invoked when an error occurs while handling a request
     * for a configured module.
     */
    internalError?: filters.ErrorFilter

}
