import { Immutable } from '@quenk/potoo/lib/actor/resident';

import { App } from '../../src/app';

export class Child extends Immutable<void, App> {

    receive = [];

    stop() {

        process.env.CHILD_RUNNING = 'no';

    }

    run() {

        process.env.CHILD_RUNNING = 'yes';

    }

}
