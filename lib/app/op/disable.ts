import * as log from '@quenk/potoo/lib/actor/system/log';
import * as codes from './';
import { Op } from '@quenk/potoo/lib/actor/system/op';
import { Context, getModule } from '../state/context';
import { Module } from '../module';
import { App } from '../';

/**
 * Disable instruction.
 *
 * Sets the disable flag.
 */
export class Disable extends Op<Context> {

    constructor(public module: Module) { super(); }

    level = log.WARN;

    code = codes.OP_DISABLE;

    exec(app: App): void {

        return getModule(app.state, this.module.self())
            .map(m => { m.disabled = true; })
            .orJust(() => console.warn(`${this.module.self()}: Cannot be disabled!`))
            .get();

    }

}
