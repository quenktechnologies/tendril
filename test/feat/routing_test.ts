import axios from 'axios';

import { expect } from '@jest/globals';

import { unflatten } from '@quenk/noni/lib/data/record/path';

import { App } from '../../lib/app';
import { createApp } from './fixtures/app';
import { badRequest, error, ok } from '../../lib/app/api/response';
import { ModuleInfo } from '../../lib/app/module';
import { RequestContext } from '../../lib/app/api';

const agent = axios.create({
    baseURL: 'http://localhost:2407',
    validateStatus: () => true
});

let app: App | undefined;

describe('tendril', () => {
    afterEach(async () => {
        if (app) await app.stop();
        app = undefined;
    });

    describe('routing support', () => {
        it('should serve a route', async () => {
            let wasCalled = false;
            app = await createApp(
                unflatten({
                    id: '/',
                    'app.routing.routes': (m: ModuleInfo) => [
                        {
                            method: 'get',
                            path: '/',
                            tags: { test: true },
                            filters: [
                                async (ctx: RequestContext) => {
                                    expect(ctx).toBeDefined();
                                    expect(ctx.actor).toBe(m.module);
                                    wasCalled = true;
                                    return ok(m.address);
                                }
                            ]
                        }
                    ]
                })
            );

            let res = await agent.get('/');
            expect(res.status).toEqual(200);
            expect(res.data).toEqual(app.modules['/'].address);
            expect(wasCalled).toBe(true);
        });

        it('should serve submodule routes', async () => {
            let called: number[] = [];
            app = await createApp({
                id: '/',
                app: {
                    routing: {
                        routes: () => [
                            {
                                method: 'get',
                                path: '/',
                                tags: {},
                                filters: [
                                    async () => {
                                        called.push(1);
                                        return ok();
                                    }
                                ]
                            }
                        ]
                    }
                },
                modules: {
                    sub: {
                        app: {
                            routing: {
                                routes: () => [
                                    {
                                        method: 'get',
                                        path: '/',
                                        tags: {},
                                        filters: [
                                            async () => {
                                                called.push(2);
                                                return ok();
                                            }
                                        ]
                                    }
                                ]
                            }
                        },
                        modules: {
                            zero: {
                                app: {
                                    routing: {
                                        routes: () => [
                                            {
                                                method: 'get',
                                                path: '/',
                                                tags: {},
                                                filters: [
                                                    async () => {
                                                        called.push(3);
                                                        return ok();
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            });

            let res = await agent.get('/');
            expect(res.status).toEqual(200);

            res = await agent.get('/sub');
            expect(res.status).toEqual(200);

            res = await agent.get('/sub/zero');
            expect(res.status).toEqual(200);

            expect(called).toMatchObject(expect.arrayContaining([1, 2, 3]));
        });

        it('should execute each filter', async () => {
            let count = 0;
            app = await createApp({
                id: '/',
                app: {
                    routing: {
                        routes: () => [
                            {
                                method: 'get',
                                path: '/',
                                tags: {},
                                filters: [
                                    async () => {
                                        count++;
                                    },
                                    async () => {
                                        count++;
                                    },
                                    async () => ok()
                                ]
                            }
                        ]
                    }
                }
            });

            let res = await agent.get('/');
            expect(res.status).toEqual(200);
            expect(count).toEqual(2);
        });

        it('should invoke the 404 handler for invalid routes', async () => {
            let called = false;
            app = await createApp({
                id: '/',
                app: {
                    routing: {
                        on: {
                            none: async () => {
                                called = true;
                                return ok(200);
                            }
                        }
                    }
                }
            });

            let res = await agent.get('/foo');
            expect(res.status).toEqual(200);
            expect(called).toEqual(true);
        });

        it('should invoke the error handler ', async () => {
            let called = false;
            app = await createApp({
                id: '/',
                app: {
                    routing: {
                        on: {
                            error: async () => {
                                called = true;
                                return ok(200);
                            }
                        },
                        routes: () => [
                            {
                                method: 'get',
                                path: '/',
                                tags: {},
                                filters: [
                                    async () => error(new Error('failed'))
                                ]
                            }
                        ]
                    }
                }
            });

            //TODO: invoke handler before send.
            let res = await agent.get('/');
            expect(res.status).toEqual(500);
            expect(called).toEqual(false);
        });

        it('should use middleware', async () => {
            app = await createApp({
                id: '/',
                app: {
                    middleware: {
                        available: {
                            end: {
                                provider: () => (_, res) => {
                                    res.sendStatus(500);
                                }
                            },
                            mware: {
                                provider:
                                    (...nums: number[]) =>
                                    (req, _, next) => {
                                        expect(nums).toEqual([1, 2, 3]);
                                        req.body = JSON.stringify(nums);
                                        next();
                                    },
                                options: [1, 2, 3]
                            }
                        },
                        enabled: [
                            'mware',
                            (req, res) => {
                                res.status(201).send(req.body);
                            }
                        ]
                    },
                    routing: {
                        routes: () => [
                            {
                                method: 'get',
                                path: '/',
                                tags: {},
                                filters: [async () => ok([])]
                            }
                        ]
                    }
                }
            });

            let res = await agent.get('/');
            expect(res.status).toEqual(201);
            expect(res.data).toEqual([1, 2, 3]);
        });

        it('should inherit global filters', async () => {
            let payload = 0;
            let send = async () => {
                return ok(payload);
            };
            app = await createApp({
                id: '/',
                app: {
                    filters: [
                        async () => {
                            payload++;
                        }
                    ],
                    routing: {
                        routes: () => [
                            {
                                method: 'get',
                                path: '/',
                                tags: {},
                                filters: [send]
                            }
                        ]
                    }
                },
                modules: {
                    child: {
                        app: {
                            routing: {
                                routes: () => [
                                    {
                                        method: 'get',
                                        path: '/',
                                        tags: {},
                                        filters: [send]
                                    }
                                ]
                            }
                        },
                        modules: {
                            gchild: {
                                app: {
                                    routing: {
                                        routes: () => [
                                            {
                                                method: 'get',
                                                path: '/',
                                                tags: {},
                                                filters: [send]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    other: {
                        app: {
                            routing: {
                                routes: () => [
                                    {
                                        method: 'get',
                                        path: '/',
                                        tags: {},
                                        filters: [async () => badRequest()]
                                    }
                                ]
                            }
                        }
                    }
                }
            });

            let res = await agent.get('/');
            expect(res.data).toEqual(1);

            res = await agent.get('/child');
            expect(res.data).toEqual(2);

            res = await agent.get('/child/gchild');
            expect(res.data).toEqual(3);
        });
    });
});
