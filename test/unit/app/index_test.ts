import { assert } from '@quenk/test/lib/assert';
import { Mutable } from '@quenk/potoo/lib/actor/resident';

import { App } from '../../../src/app';
import { template } from '../../fixtures/ledger';

let ran = false;

class Act extends Mutable {

    run() {

        ran = true;

    }

}

describe('app', () => {

    describe('App', () => {

        it('should spawn actors', cb => {

            let app: App = new App(template);

            app.spawn({ id: 'act', create: s => new Act(<App>s) });

            setTimeout(() => {

                assert(ran).true();
                ran = false;
                cb();

            }, 200);


        });

        it('should not loop indefinitely on raised error', cb => {

            let app: App = new App(template);

            try {

                app.spawn({ id: '$theme', create: s => new Act(<App>s) });

            } catch (_) {


            }

            setTimeout(() => {

                assert(true).true();
                cb();

            }, 1000)

        });

    });

});
