import * as log from '@quenk/potoo/lib/actor/system/log';
import * as codes from './';
import { just } from '@quenk/noni/lib/data/maybe';
import { Op } from '@quenk/potoo/lib/actor/system/op';
import { Context, getModule } from '../state/context';
import { Module } from '../module';
import { App } from '../';

/**
 * Redirect instruction.
 *
 * Forces a module to redirect all requests to a new location.
 */
export class Redirect extends Op<Context> {

    constructor(
        public module: Module,
        public status: number,
        public location: string) { super(); }

    level = log.WARN;

    code = codes.OP_REDIRECT;

    exec(app: App): void {

        let { location, status } = this;

        return getModule(app.state, this.module.self())
            .map(m => { m.redirect = just({ location, status }) })
            .orJust(() => console.warn(`${this.module.self()}: Cannot be enabled!`))
            .get();

    }

}
