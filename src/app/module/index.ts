import { Immutable } from '@quenk/potoo/lib/actor/resident';
import { Context } from '../state/context';
import { App } from '../';

export class Module extends Immutable<void, Context> {

    constructor(public system: App) { super(system); }

    receive = [];

    run() { }

}
