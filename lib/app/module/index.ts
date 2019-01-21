import { pure } from '@quenk/noni/lib/control/monad/future';
import {  Case } from '@quenk/potoo/lib/actor/resident/case';
import { Immutable  } from '@quenk/potoo/lib/actor/resident';
import { Context } from '../state/context';
import { Route, SupportedMethod } from '../op/route';
import { Disable as DisableOp } from '../op/disable';
import { Enable as EnableOp } from '../op/enable';
import { Redirect as RedirectOp } from '../op/redirect';
import { Filter } from '../api/filter';
import { show } from '../api/action/show';
import { App } from '../';

/**
 * Messages supported by modules.
 */
export type Messages<M>
    = Disable
    | Enable
    | Redirect
    | M
    ;

/**
 * Disable a Module.
 *
 * All requests to the Module will 404.
 */
export class Disable { }

/**
 * Enable a Module.
 */
export class Enable { }

/**
 * Redirect requests to the module to another location.
 */
export class Redirect {

    constructor(public status: number, public location: string) { }

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
export class Module extends Immutable<Messages<any>, Context, App> {

    constructor(public system: App) { super(system); }

    receive: Case<Messages<void>>[] = behave(this);

    /**
     * install a route into the module's routing table.
     *
     * This is done as sys op to provide transparency.
     */
    install<A>(method: SupportedMethod, path: string, filters: Filter<A>[]): void {

        this.system.exec(new Route(this.self(), method, path, filters));

    }

    /**
     * show constructrs a Filter for displaying a view.
     */
    show(name: string, ctx?: object): Filter<undefined> {

        return () => pure(show(name, ctx));

    }

    run() { }

}

const behave = (m: Module): Case<Messages<void>>[] => (<Case<Messages<void>>[]>[

    new Case(Disable, disable(m)),

    new Case(Enable, enable(m)),

    new Case(Redirect, redirect(m))

]);

const disable = (m: Module) => (_: Disable) =>
    m.system.exec(new DisableOp(m));

const enable = (m: Module) => (_: Enable) =>
    m.system.exec(new EnableOp(m));

const redirect = (m: Module) => ({ status, location }: Redirect) =>
    m.system.exec(new RedirectOp(m, status, location));
