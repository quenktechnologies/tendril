import { Case } from '@quenk/potoo/lib/actor/resident/case';
import { Immutable } from '@quenk/potoo/lib/actor/resident';
import { Method } from '../api/request';
import { Context } from '../state/context';
import { Filter } from '../api/filter';
import { App } from '../';
/**
 * Messages supported by modules.
 */
export declare type Messages<M> = Disable | Enable | Redirect | M;
/**
 * Disable a Module.
 *
 * All requests to the Module will 404.
 */
export declare class Disable {
}
/**
 * Enable a Module.
 */
export declare class Enable {
}
/**
 * Redirect requests to the module to another location.
 */
export declare class Redirect {
    status: number;
    location: string;
    constructor(status: number, location: string);
}
/**
 * Module of the application.
 *
 * A tendril application breaks up it's routes and related code
 * into a series of modules. Each module is an actor with the
 * ability to send and receive messages.
 *
 * Most actions of a Module are implemented using Op classes that
 * are executed by the App.
 *
 * This makes debugging slightly easier as we can review to some extent what
 * individual modules are doing via the op log.
 */
export declare class Module extends Immutable<Messages<any>, Context, App> {
    system: App;
    constructor(system: App);
    receive: Case<Messages<void>>[];
    /**
     * install a route into the module's routing table.
     *
     * This is done as sys op to provide transparency.
     */
    install<A>(method: Method, path: string, filters: Filter<A>[]): void;
    disable(): void;
    enable(): void;
    redirect(location: string, status: number): void;
    /**
     * show constructrs a Filter for displaying a view.
     */
    show(name: string, ctx?: object): Filter<undefined>;
    run(): void;
}
