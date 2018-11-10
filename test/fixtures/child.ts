import { Immutable } from '@quenk/potoo/lib/actor/resident';
import { Context } from '../../src/app/state/context';

export class Child extends Immutable<void, Context> {

    receive = [];

  stop() {

    process.env.CHILD_RUNNING = 'no';

  }

    run() {

        process.env.CHILD_RUNNING = 'yes';

    }

}
