import { Immutable } from '@quenk/potoo/lib/actor/resident';
import { Context } from '../state/context';
import { App } from '../';
export declare class Module extends Immutable<void, Context> {
    system: App;
    constructor(system: App);
    receive: never[];
    run(): void;
}
