import { must } from '@quenk/must';
import { Mutable } from '@quenk/potoo/lib/actor/resident';
import { App } from '../../../src/app';
import { Context } from '../../../src/app/state/context';
import { template } from '../../fixtures/ledger';

let ran = false;

class Act extends Mutable<Context, App> {

    run() {

        ran = true;

    }

}

describe('app', () => {

    describe('App', () => {

        it('should spawn actors', cb => {

            let app: App = new App(template, {});

            app.spawn({ id: 'act', create: s => new Act(s) });

            setTimeout(() => {

                must(ran).be.true();
                ran = false;
                cb();

            }, 200);


        });

    });

});
