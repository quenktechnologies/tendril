import * as express from 'express';

import {
    toPromise,
    doFuture,
    attempt,
    pure
} from '@quenk/noni/lib/control/monad/future';
import { assert } from '@quenk/test/lib/assert';

import { Template } from '../../../lib/app/module/template';
import { ok } from '../../../lib/app/api/response';
import { Module } from '../../../lib/app/module';
import { doAction } from '../../../lib/app/api';
import { App } from '../../../lib/app';
import { getToken } from '../../../lib/app/api/csrf';
import { createAgent } from '../fixtures/agent';

process.env.PORT = '8888';

let token = '';

const getCSRFToken = () => doAction<undefined>(function*() {
    let value = yield getToken();
    return ok(value);
});

const template = (): Template => ({

    id: '/',

    create: s=> new Module(<App>s),

    server: {

        host: 'localhost',

        port: Number(process.env.PORT)

    },

    app: {

        session: {

            enable: true

        },

        log: {

            enable: true

        },

        csrf: {

            token: {

                enable: true,

                send_cookie: true

            },

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

        routes: () => [

            {
                method: 'get',
                path: '/token',
                filters: [getCSRFToken],
              tags:{}
            }

        ]

    }

})

describe('csrf', () => {

    let app = new App(template);

    beforeEach(() => toPromise(app.start()));

    afterEach(() => toPromise(app.stop()));

    describe('getToken', () => {

        it('should provide the current csrf token value', () =>
            toPromise(doFuture<undefined>(function*() {

                let agent = createAgent();

                let res = yield agent.get('/token', {});

                yield attempt(() => {

                    assert(res.body.join('').trim()).equal(token);

                });

                return pure(undefined);

            })));
    });

});
