import {
    toPromise,
    doFuture,
    attempt,
    pure
} from '@quenk/noni/lib/control/monad/future';
import { assert } from '@quenk/test/lib/assert';

import { Template } from '../../../../lib/app/module/template';
import { Module } from '../../../../lib/app/module';
import { App } from '../../../../lib/app';
import { createAgent } from '../../fixtures/agent';

process.env.PORT = '8888';

const template = (): Template<App> => ({

    id: '/',

    create: (a: App) => new Module(a),

    server: {

        host: 'localhost',

        port: Number(process.env.PORT)

    },

    app: {

        dirs: {

            self: `/test/feat/boot/stage/data`,

            'public': 'public'

        },

        modules: {

            child0: (): Template<App> => ({

                id: 'child0',

                create: (a: App) => new Module(a),

                app: {

                    dirs: {

                        self: `/test/feat/boot/stage/data/child0`,

                        'public': 'public'

                    }

                }

            })

        }

    }

})

describe('static', () => {

    let app = new App(template);

    beforeEach(() => toPromise(app.start()));

    afterEach(() => toPromise(app.stop()));

    it('should treat app.dirs.self as relative to process.cwd()', () =>
        toPromise(doFuture<undefined>(function*() {

            let agent = createAgent();
            let res = yield agent.get('/zero.txt');

            yield attempt(() => {
                assert(res.body.join('').trim()).equal('zero');
            });

            let res1 = yield agent.get('/one.txt');

            yield attempt(() => {
                assert(res1.body.join('').trim()).equal('one');
            });

            return pure(undefined);

        })));

});
