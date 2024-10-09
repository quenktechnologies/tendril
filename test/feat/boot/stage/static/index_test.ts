import { doFuture, attempt, pure } from '@quenk/noni/lib/control/monad/future';
import { assert } from '@quenk/test/lib/assert';

import { Template } from '../../../../../lib/app/module/template';
import { App } from '../../../../../lib/app';
import { createAgent } from '../../../fixtures/agent';

process.env.PORT = '8888';

const template = (): Template => ({
    id: '/',

    server: {
        host: 'localhost',

        port: Number(process.env.PORT)
    },

    app: {
        dirs: {
            self: `/test/feat/boot/stage/static/data`
        },

        modules: {
            one: (): Template => ({
                id: 'one',

                app: {
                    dirs: {
                        self: '/test/feat/boot/stage/static/data/one',

                        public: 'public1'
                    },

                    modules: {
                        two: (): Template => ({
                            id: 'two',

                            app: {
                                dirs: {
                                    self: `/test/feat/boot/stage/static/data/two`,

                                    public: ['public2']
                                }
                            }
                        })
                    }
                }
            }),

            three: (): Template => ({
                id: 'three',

                app: {
                    dirs: {
                        self: `/test/feat/boot/stage/static/data/three`,

                        public: {
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
});

describe('static', () => {
    let app: App;
    let agent = createAgent();

    beforeEach(() => {
        app = new App(template);
        return app.start();
    });

    afterEach(() => app.stop());

    it('should treat app.dirs.self as relative to process.cwd()', () =>
        doFuture(function* () {
            let res = yield agent.get('/0.txt');

            return attempt(() => {
                assert(res.body.join('').trim()).equal('zero');
            });
        }));

    it('should work when app.dirs.public is a string', () =>
        doFuture(function* () {
            let res1 = yield agent.get('/1.txt');

            yield attempt(() => {
                assert(res1.body.join('').trim()).equal('one');
            });

            return pure(undefined);
        }));

    it('should serve when app.dirs.public is an array', () =>
        doFuture(function* () {
            let res = yield agent.get('/2.txt');

            return attempt(() => {
                assert(res.body.join('').trim()).equal('two');
            });
        }));

    it('should serve when app.dirs.public is an object', () =>
        doFuture(function* () {
            let res = yield agent.get('/3.txt');

            return attempt(() => {
                assert(res.body.join('').trim()).equal('three');
            });
        }));
});
