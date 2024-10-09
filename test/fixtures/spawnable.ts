import { Immutable } from '@quenk/potoo/lib/actor/resident/immutable';

export class Spawnable extends Immutable<void> {
    stop() {
        process.env.SPAWNABLE_RUNNING = 'no';
    }

    run() {
        process.env.SPAWNABLE_RUNNING = 'yes';
    }
}
