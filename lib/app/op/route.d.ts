import { Op } from '@quenk/potoo/lib/actor/system/op';
import { Address } from '@quenk/potoo/lib/actor/address';
import { Context } from '../state/context';
import { Filter } from '../api';
import { App } from '../';
/**
 * SupportedMethod
 */
export declare type SupportedMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
/**
 * Route instructs the App to install a new route
 * for a module.
 */
export declare class Route<A> extends Op<Context> {
    module: Address;
    method: SupportedMethod;
    path: string;
    filters: Filter<A>[];
    constructor(module: Address, method: SupportedMethod, path: string, filters: Filter<A>[]);
    code: number;
    level: number;
    exec(app: App): void;
}
