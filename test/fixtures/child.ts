import { Immutable } from '@quenk/potoo/lib/actor/resident/immutable';

export class Child extends Immutable<void> {

    stop() {

        process.env.CHILD_RUNNING = 'no';

    }

    run() {

        process.env.CHILD_RUNNING = 'yes';

    }

}
