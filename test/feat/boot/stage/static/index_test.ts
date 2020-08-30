import {
    toPromise,
    doFuture,
    attempt,
    pure
} from '@quenk/noni/lib/control/monad/future';
import { assert } from '@quenk/test/lib/assert';

import { Template } from '../../../../../lib/app/module/template';
import { Module } from '../../../../../lib/app/module';
import { App } from '../../../../../lib/app';
import { createAgent } from '../../../fixtures/agent';

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

            self: `/test/feat/boot/stage/static/data`,

        },

        modules: {

            one: (): Template<App> => ({

                id: 'one',

                create: (a: App) => new Module(a),

                app: {

                    dirs: {

                        self: '/test/feat/boot/stage/static/data/one',

                        'public': 'public1'

                    },

                    modules: {

                        two: (): Template<App> => ({

                            id: 'two',

                            create: (a: App) => new Module(a),

                            app: {

                                dirs: {

                                    self: `/test/feat/boot/stage/static/data/two`,

                                    'public': ['public2']

                                }

                            }

                        })

                    }

                }

            }),

            three: (): Template<App> => ({

                id: 'three',

                create: (a: App) => new Module(a),

                app: {

                    dirs: {

                        self: `/test/feat/boot/stage/static/data/three`,

                        'public': {

                            public3: {

                                dir: 'public3',

                                options: {}

                            }
                        }
                    }
                }
            })
        }
    }
})

describe('static', () => {

    let app = new App(template);
    let agent = createAgent();

    beforeEach(() => toPromise(app.start()));

    afterEach(() => toPromise(app.stop()));

    it('should treat app.dirs.self as relative to process.cwd()', () =>
        toPromise(doFuture(function*() {

            let res = yield agent.get('/0.txt');

            return attempt(() => {
                assert(res.body.join('').trim()).equal('zero');
            });

        })));

    it('should work when app.dirs.public is a string', () =>
        toPromise(doFuture(function*() {

            let res1 = yield agent.get('/1.txt');

            yield attempt(() => {
                assert(res1.body.join('').trim()).equal('one');
            });

            return pure(undefined);

        })));

    it('should serve when app.dirs.public is an array', () =>
        toPromise(doFuture(function*() {

            let res = yield agent.get('/2.txt');

            return attempt(() => {
                assert(res.body.join('').trim()).equal('two');
            });

        })));

    it('should serve when app.dirs.public is an object', () =>
        toPromise(doFuture(function*() {

            let res = yield agent.get('/3.txt');

            return attempt(() => {
                assert(res.body.join('').trim()).equal('three');
            });

        })));

});
