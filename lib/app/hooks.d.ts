import { Future } from '@quenk/noni/lib/control/monad/future';
/**
 * Init function type.
 */
export declare type Init = () => Future<void>;
/**
 * Connected function type.
 */
export declare type Connected = () => Future<void>;
/**
 * Started function type.
 */
export declare type Started = () => Future<void>;
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
     * started is invoked when the application is ready to serve requests.
     */
    started?: Started;
}
