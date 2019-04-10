import * as express from 'express';
import { just, nothing } from '@quenk/noni/lib/data/maybe';
import { Case } from '@quenk/potoo/lib/actor/resident/case';
import { Immutable } from '@quenk/potoo/lib/actor/resident';
import { Method } from '../api/request';
import { Context, getModule } from '../state/context';
import { Context as RequestContext } from '../api/context';
import { Filter } from '../api/filter';
import { show } from '../api/action/response';
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

    receive: Case<Messages<void>>[] = <Case<Messages<void>>[]>[

        new Case(Disable, () => this.disable()),

        new Case(Enable, () => this.enable()),

        new Case(Redirect, (r: Redirect) => this.redirect(r.location, r.status))

    ];

    /**
     * install a route into the module's routing table.
     *
     * This is done as sys op to provide transparency.
     */
    install<A>(method: Method, path: string, filters: Filter<A>[]): void {

        let maybeModule = getModule(this.system.state, this.self());

        if (maybeModule.isJust()) {

            let m = maybeModule.get();

            m.app[method](path, (req: express.Request, res: express.Response) =>
                new RequestContext(this, req, res, filters.slice()).run());

        }

    }

    disable() {

        getModule(this.system.state, this.self())
            .map(m => { m.disabled = true; })
            .orJust(() => console.warn(`${this.self()}: Cannot be disabled!`))
            .get();

    }

    enable() {

        getModule(this.system.state, this.self())
            .map(m => { m.disabled = false; m.redirect = nothing() })
            .orJust(() => console.warn(`${this.self()}: Cannot be enabled!`))
            .get();

    }

    redirect(location: string, status: number) {

        return getModule(this.system.state, this.self())
            .map(m => { m.redirect = just({ location, status }) })
            .orJust(() => console.warn(`${this.self()}: Cannot be enabled!`))
            .get();

    }

    /**
     * show constructrs a Filter for displaying a view.
     */
    show(name: string, ctx?: object): Filter<undefined> {

        return () => show(name, ctx);

    }

    run() { }

}
