import { Immutable } from '@quenk/potoo/lib/actor/framework/resident';

export class Child extends Immutable<void> {
    async stop() {
        process.env.CHILD_RUNNING = 'no';
    }

    async run() {
        process.env.CHILD_RUNNING = 'yes';
    }
}
