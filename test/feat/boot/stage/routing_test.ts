import {
    toPromise,
    doFuture,
    pure,
} from '@quenk/noni/lib/control/monad/future';
import { Type } from '@quenk/noni/lib/data/type';

import { assert } from '@quenk/assert-async';

import { Template } from '../../../../lib/app/module/template';
import { ok } from '../../../../lib/app/api/response';
import { next } from '../../../../lib/app/api/control';
import { Module } from '../../../../lib/app/module';
import { App } from '../../../../lib/app';
import { createAgent } from '../../fixtures/agent';

process.env.PORT = '8888';

const template = (calls: number[]) => (): Template => ({

    id: '/',

    create: s => new Module(<App>s),

    server: {

        host: 'localhost',

        port: Number(process.env.PORT)

    },

    app: {

        filters: [(r: Type) => {

            calls.push(1);

            return next(r);

        }],

        modules: {

            child0: (): Template => ({

                id: 'child0',

                create: s => new Module(<App>s),

                app: {

                    filters: [(r: Type) => {

                        calls.push(2);

                        return next(r);

                    }],

                    modules: {

                        child1: (): Template => ({

                            id: 'child1',

                            create: s => new Module(<App>s),

                            app: {

                                filters: [
                                    (r: Type) => {

                                        calls.push(3);

                                        return next(r);

                                    }],

                                routes: () => [

                                    {

                                        method: 'get',

                                        path: '/',

                                        filters: [() => {

                                            calls.push(4);

                                            return ok();

                                        }],

                                        tags: {}
                                    },

                                ]

                            }

                        })

                    }

                }

            }),

            child2: (): Template => ({

                id: 'child2',

                create: s => new Module(<App>s),

                app: {

                    path: 'alt',

                    routes: () => [
                        {
                            method: 'get',

                            path: '/',

                            filters: [() => ok('alt')],

                            tags: {}
                        }

                    ]

                }

            })

        }

    }

});

describe('routing', () => {

    let app: App;

    let calls = <number[]>[];

    beforeEach(() => {

        calls = [];
        app = new App(template(calls));

    });

    beforeEach(() => toPromise(app.start()));

    afterEach(() => toPromise(app.stop()));

    it('should install inherited conf filters', () =>
        toPromise(doFuture<undefined>(function*() {

            let agent = createAgent();

            let r = yield agent.get('/child0/child1', {});

            yield assert(r.code).equal(200);

            yield assert(calls).equate([1, 2, 3, 4]);

            return pure(undefined);

        })));

    it('should install to app.path', () =>
        doFuture(function*() {

            let agent = createAgent();

            let res = yield agent.get('/alt', {});

            yield assert(res.code).equal(200);

            yield assert(res.body.toString()).equate('alt');

            return pure(undefined);

        }))

});
