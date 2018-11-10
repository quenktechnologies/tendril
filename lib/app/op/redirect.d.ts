import { Op } from '@quenk/potoo/lib/actor/system/op';
import { Context } from '../state/context';
import { Module } from '../module';
import { App } from '../';
/**
 * Redirect instruction.
 *
 * Forces a module to redirect all requests to a new location.
 */
export declare class Redirect extends Op<Context> {
    module: Module;
    status: number;
    location: string;
    constructor(module: Module, status: number, location: string);
    level: number;
    code: number;
    exec(app: App): void;
}
