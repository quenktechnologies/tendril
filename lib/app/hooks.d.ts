import { Future } from '@quenk/noni/lib/control/monad/future';
import { App } from './';
/**
 * Init function type.
 */
export declare type Init = (app: App) => Future<void>;
/**
 * Connected function type.
 */
export declare type Connected = (app: App) => Future<void>;
/**
 * Start function type.
 */
export declare type Start = (app: App) => Future<void>;
/**
 * Configuration section.
 */
export interface Hooks {
    /**
     * init is invoked before the application is configured.
     */
    init?: Init;
    /**
     * connected is invoked when all connections have been established.
     */
    connected?: Connected;
    /**
     * start is invoked when the application is ready to serve requests.
     */
    start?: Start;
}
