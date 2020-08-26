import * as express from 'express';
import * as prs from '../../../../lib/app/api/storage/prs';

import {
    Future,
    toPromise,
    doFuture,
    attempt,
    pure
} from '@quenk/noni/lib/control/monad/future';
import { assert } from '@quenk/test/lib/assert';

import { Template } from '../../../../lib/app/module/template';
import { ok, show } from '../../../../lib/app/api/response';
import { Module } from '../../../../lib/app/module';
import { doAction } from '../../../../lib/app/api';
import { App } from '../../../../lib/app';
import { Content } from '../../../../lib/app/show';
import { createAgent } from '../../fixtures/agent';
import {
    PRS_CSRF_TOKEN
} from '../../../../lib/app/boot/stage/csrf-token';

process.env.PORT = '8888';

let token = '';

const fromPRS = () => doAction<undefined>(function*() {
    let value = yield prs.getString(PRS_CSRF_TOKEN);
    return ok(value);
});

const fromViewCtx = () => doAction<undefined>(function*() {
    return show('');
});

const showFunc = (_: string, ctx: any): Future<Content> =>
    pure(<Content>{
        type: 'text/plain',
        content: ctx.csrf.token
    });

const template = (): Template<App> => ({

    id: '/',

    create: (a: App) => new Module(a),

    server: {

        host: 'localhost',

        port: Number(process.env.PORT)

    },

    app: {

        session: {

            enable: true

        },

        csrf: {

            token: {

                enable: true

            }

        },

        middleware: {

            available: {

                capture: {

                    provider: () => (
                        req: express.Request,
                        _: express.Response,
                        next: express.NextFunction) => {

                        token = req.csrfToken();

                        next();

                    },

                }

            },

            enabled: ['capture']

        },

        views: {

            provider: () => showFunc

        },

        routes: () => [

            {
                method: 'get',
                path: '/prs',
                filters: [fromPRS]
            },
            {
                method: 'get',
                path: '/view',
                filters: [fromViewCtx]
            }

        ],

        modules: {

            child0: (): Template<App> => ({

                id: 'child0',

                create: (a: App) => new Module(a),

                app: {

                    routes: () => [

                        {
                            method: 'get',
                            path: '/prs',
                            filters: [fromPRS]
                        },
                        {
                            method: 'get',
                            path: '/view',
                            filters: [fromViewCtx]
                        }

                    ]

                }

            })

        }

    }

})

describe('csrf-token', () => {

    let app = new App(template);

    beforeEach(() => toPromise(app.start()));

    afterEach(() => toPromise(app.stop()));

    it('should provide the current csrf token via PRS', () =>
        toPromise(doFuture<undefined>(function*() {

            let agent = createAgent();
            let res = yield agent.get('/prs', {});

            yield attempt(() => {
                assert(res.body.join('').trim()).equal(token);
            });

            return pure(undefined);

        })));

    it('should provide the current csrf token via the view context', () =>
        toPromise(doFuture<undefined>(function*() {

            let agent = createAgent();
            let res = yield agent.get('/view', {});

            yield attempt(() => {
                assert(res.body.join('').trim()).equal(token);
            });

            return pure(undefined);

        })));

    it('should provide the PRS token if child does not enable csrf', () =>
        toPromise(doFuture<undefined>(function*() {

            let agent = createAgent();
            let res = yield agent.get('/child0/prs', {});

            yield attempt(() => {
                assert(res.body.join('').trim()).equal(token);
            });

            return pure(undefined);

        })));

    it('should provide the view context token if child does not enable csrf', () =>
        toPromise(doFuture<undefined>(function*() {

            let agent = createAgent();
            let res = yield agent.get('/child0/view', {});

            yield attempt(() => {
                assert(res.body.join('').trim()).equal(token);
            });

            return pure(undefined);

        })));
});
