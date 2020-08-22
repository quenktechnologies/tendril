import * as session from '../../../lib/app/api/storage/session';

import {
    toPromise,
    doFuture,
    attempt,
    pure
} from '@quenk/noni/lib/control/monad/future';
import { assert } from '@quenk/test/lib/assert';

import { Template } from '../../../lib/app/module/template';
import { Request } from '../../../lib/app/api/request';
import { ok } from '../../../lib/app/api/response';
import { Module } from '../../../lib/app/module';
import { doAction } from '../../../lib/app/api';
import { App } from '../../../lib/app';
import { createAgent } from '../fixtures/agent';

process.env.PORT = '8888';

const setTTLValue = (value: string, ttl: number) => (_: Request) =>
    doAction<undefined>(function*() {

        yield session.set('value', value, { ttl });
        return ok();

    });

const getTTLValue = () => doAction<undefined>(function*() {

    let value = yield session.getString('value');
    return ok(value);

});

const alwaysOk = () => ok();

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

        routes: () => [

            {
                method: 'get',
                path: '/value-ttl',
                filters: [getTTLValue]
            },
            {
                method: 'post',
                path: '/value-ttl',
                filters: [setTTLValue('foo', 3)]
            },
            {
                method: 'get',
                path: '/ok',
                filters: [alwaysOk]
            }

        ]

    }

})

describe('session', () => {

    let app = new App(template);

    beforeEach(() => toPromise(app.start()));

    afterEach(() => toPromise(app.stop()));

    describe('TTL', () => {

        it('should decrement values on each request', () =>
            toPromise(doFuture<undefined>(function*() {

                let agent = createAgent();

                yield agent.post('/value-ttl', {});

                // 3
                let res = yield agent.get('/value-ttl', {});
                yield attempt(() => assert(res.body.join('')).equal('foo'));

                // 2
                yield agent.get('/ok');

                // 1
                res = yield agent.get('/value-ttl', {});

                yield attempt(() => assert(res.body.join('')).equal('foo'));

                res = yield agent.get('/value-ttl', {});
                yield attempt(() => assert(res.body.join('')).equal(''));

                return pure(undefined);

            })));

    });

});
