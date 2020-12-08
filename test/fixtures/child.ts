import { Immutable } from '@quenk/potoo/lib/actor/resident';

export class Child extends Immutable<void> {

    receive = [];

    stop() {

        process.env.CHILD_RUNNING = 'no';

    }

    run() {

        process.env.CHILD_RUNNING = 'yes';

    }

}
