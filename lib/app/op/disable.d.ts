import { Op } from '@quenk/potoo/lib/actor/system/op';
import { Context } from '../state/context';
import { Module } from '../module';
import { App } from '../';
/**
 * Disable instruction.
 *
 * Sets the disable flag.
 */
export declare class Disable extends Op<Context, App> {
    module: Module;
    constructor(module: Module);
    level: number;
    code: number;
    exec(app: App): void;
}
