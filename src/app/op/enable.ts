import * as log from '@quenk/potoo/lib/actor/system/log';
import * as codes from './';
import { nothing  } from '@quenk/noni/lib/data/maybe';
import { Op } from '@quenk/potoo/lib/actor/system/op';
import { Context, getModule } from '../state/context';
import { Module } from '../module';
import { App } from '../';

/**
 * Enable instruction.
 *
 * Removes the disable flag and redirecting from a module.
 */
export class Enable extends Op<Context, App> {

    constructor(public module: Module) { super(); }

    level = log.WARN;

    code = codes.OP_ENABLE;

    exec(app: App): void {

        return getModule(app.state, this.module.self())
            .map(m => { m.disabled = false; m.redirect = nothing() })
            .orJust(() => console.warn(`${this.module.self()}: Cannot be enabled!`))
            .get();

    }

}
