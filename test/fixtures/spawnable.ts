import { Immutable } from '@quenk/potoo/lib/actor/resident';
import { Context } from '../../src/app/state/context';
import { App } from '../../src/app';

export class Spawnable extends Immutable<void, Context, App> {

    receive = [];

    stop() {

        process.env.SPAWNABLE_RUNNING = 'no';

    }

    run() {

        process.env.SPAWNABLE_RUNNING = 'yes';

    }

}
