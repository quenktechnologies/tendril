import { Immutable } from '@quenk/potoo/lib/actor/resident';
import { Context } from '../state/context';
import { Install, SupportedMethod } from '../op';
import { Handler, Filter } from '../api';
import { App } from '../';

export class Module extends Immutable<void, Context> {

    constructor(public system: App) { super(system); }

    receive = [];

    /**
     * install a route into the module's routing table.
     *
     * This is done as sys op to provide transparency.
     */
    install<A>(
        method: SupportedMethod,
        path: string,
        filters: Filter<A>[],
        handler: Handler<A>) {

        this.system.exec(new Install(this.self(), method, path, filters, handler));

    }

    run() { }

}
