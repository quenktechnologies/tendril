import { Op } from '@quenk/potoo/lib/actor/system/op';
import { Context } from '../state/context';
import { Module } from '../module';
import { App } from '../';
/**
 * Enable instruction.
 *
 * Removes the disable flag and redirecting from a module.
 */
export declare class Enable extends Op<Context> {
    module: Module;
    constructor(module: Module);
    level: number;
    code: number;
    exec(app: App): void;
}
