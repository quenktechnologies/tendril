import axios from 'axios';
import * as http from 'http';

import { expect } from '@jest/globals';

import { unflatten } from '@quenk/noni/lib/data/record/path';

import { badRequest, error, ok } from '../../lib/app/api/response';
import { ModuleInfo } from '../../lib/app/module';
import { Handler, RequestContext } from '../../lib/app/api/request';
import { App } from '../../lib/app';
import { createApp } from './fixtures/app';
import { TEST_BASE_URL } from './fixtures/port';

const agent = axios.create({
    baseURL: TEST_BASE_URL,
    httpAgent: new http.Agent({ keepAlive: false }),
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
                            handler: async (ctx: RequestContext) => {
                                expect(ctx).toBeDefined();
                                wasCalled = true;
                                return ok(m.address);
                            }
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
                                handler: async () => {
                                    called.push(1);
                                    return ok();
                                }
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
                                        handler: async () => {
                                            called.push(2);
                                            return ok();
                                        }
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
                                                handler: async () => {
                                                    called.push(3);
                                                    return ok();
                                                }
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

        it('should provide the handling module in the request context', async () => {
            app = await createApp({
                id: '/',
                app: {
                    routing: {
                        routes: () => [
                            {
                                method: 'get',
                                path: '/',
                                tags: {},
                                handler: async ({ module }: RequestContext) =>
                                    ok({
                                        address: module.address,
                                        path: module.path,
                                        confPath: module.conf.app?.path ?? null
                                    })
                            }
                        ]
                    }
                },
                modules: {
                    child: {
                        app: {
                            path: '/custom',
                            routing: {
                                routes: () => [
                                    {
                                        method: 'get',
                                        path: '/',
                                        tags: {},
                                        handler: async ({
                                            module
                                        }: RequestContext) =>
                                            ok({
                                                address: module.address,
                                                path: module.path,
                                                confPath:
                                                    module.conf.app?.path ??
                                                    null
                                            })
                                    }
                                ]
                            }
                        }
                    }
                }
            });

            let res = await agent.get('/');
            expect(res.status).toEqual(200);
            expect(res.data).toEqual({
                address: '/',
                path: '/',
                confPath: null
            });

            res = await agent.get('/custom');
            expect(res.status).toEqual(200);
            expect(res.data).toEqual({
                address: '/child',
                path: '/custom',
                confPath: '/custom'
            });
        });

        it('should provide the app in the request context', async () => {
            app = await createApp({
                id: '/',
                modules: {
                    child: {}
                },
                app: {
                    routing: {
                        routes: () => [
                            {
                                method: 'get',
                                path: '/',
                                tags: {},
                                handler: async ({ app }: RequestContext) =>
                                    ok({
                                        root: app.modules['/'].address,
                                        child: app.modules['/child'].address
                                    })
                            }
                        ]
                    }
                }
            });

            let res = await agent.get('/');
            expect(res.status).toEqual(200);
            expect(res.data).toEqual({
                root: '/',
                child: '/child'
            });
        });

        it('should provide the request user when set by middleware', async () => {
            app = await createApp({
                id: '/',
                app: {
                    middleware: {
                        enabled: [
                            (req, _, next) => {
                                (<typeof req & { user?: object }>req).user = {
                                    id: 123,
                                    role: 'admin'
                                };
                                next();
                            }
                        ]
                    },
                    routing: {
                        routes: () => [
                            {
                                method: 'get',
                                path: '/',
                                tags: {},
                                handler: async ({
                                    request: { user }
                                }: RequestContext) => ok(user ?? null)
                            }
                        ]
                    }
                }
            });

            let res = await agent.get('/');
            expect(res.status).toEqual(200);
            expect(res.data).toEqual({ id: 123, role: 'admin' });
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
                                    }
                                ],
                                handler: async () => ok()
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
                                handler: async () => error(new Error('failed'))
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
                                handler: async () => ok([])
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
                return ok({ payload });
            };
            app = await createApp({
                id: '/',
                app: {
                    routing: {
                        filters: {
                            before: [
                                async () => {
                                    payload++;
                                }
                            ],

                            after: [
                                async () => {
                                    payload++;
                                }
                            ]
                        },
                        routes: () => [
                            {
                                method: 'get',
                                path: '/',
                                tags: {},
                                handler: send
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
                                        handler: send
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
                                                handler: send
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
                                        handler: async () => badRequest()
                                    }
                                ]
                            }
                        }
                    }
                }
            });

            let res = await agent.get('/');
            expect(res.data.payload).toEqual(2);

            res = await agent.get('/child');
            expect(res.data.payload).toEqual(4);

            res = await agent.get('/child/gchild');
            expect(res.data.payload).toEqual(6);
        });

        it('should 500 if no action taken', async () => {
            app = await createApp({
                id: '/',
                app: {
                    routing: {
                        routes: () => [
                            {
                                method: 'get',
                                path: '/',
                                tags: {},
                                handler: <Handler>(
                                    (<unknown>(async () => undefined))
                                )
                            }
                        ]
                    }
                }
            });

            let res = await agent.get('/');
            expect(res.status).toEqual(500);
        });

        it('should allow a route to be called multiple times', async () => {
            app = await createApp({
                id: '/',
                app: {
                    routing: {
                        routes: () => [
                            {
                                method: 'get',
                                path: '/',
                                tags: {},
                                handler: async () => ok()
                            }
                        ]
                    }
                }
            });

            for (let i = 0; i < 100; i++) {
                let res = await agent.get('/');
                expect(res.status).toEqual(200);
            }
        });

        it("should merge the owning module's tags into each route's tags", async () => {
            let tags: unknown;
            app = await createApp({
                id: '/',
                app: {
                    tags: { region: 'us' },
                    routing: {
                        routes: () => [
                            {
                                method: 'get',
                                path: '/',
                                tags: { role: 'admin' },
                                handler: async ({
                                    request
                                }: RequestContext) => {
                                    tags = request.route.tags;
                                    return ok();
                                }
                            }
                        ]
                    }
                }
            });

            let res = await agent.get('/');
            expect(res.status).toEqual(200);
            expect(tags).toEqual({ region: 'us', role: 'admin' });
        });

        it("should let a route's own tags take precedence over the module's", async () => {
            let tags: unknown;
            app = await createApp({
                id: '/',
                app: {
                    tags: { role: 'guest' },
                    routing: {
                        routes: () => [
                            {
                                method: 'get',
                                path: '/',
                                tags: { role: 'admin' },
                                handler: async ({
                                    request
                                }: RequestContext) => {
                                    tags = request.route.tags;
                                    return ok();
                                }
                            }
                        ]
                    }
                }
            });

            let res = await agent.get('/');
            expect(res.status).toEqual(200);
            expect(tags).toEqual({ role: 'admin' });
        });

        it('should inherit tags from parent modules', async () => {
            let tags: unknown;
            app = await createApp({
                id: '/',
                app: { tags: { region: 'us', role: 'guest' } },
                modules: {
                    child: {
                        app: {
                            tags: { role: 'admin' },
                            routing: {
                                routes: () => [
                                    {
                                        method: 'get',
                                        path: '/',
                                        tags: {},
                                        handler: async ({
                                            module
                                        }: RequestContext) => {
                                            tags = module.tags;
                                            return ok();
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            });

            let res = await agent.get('/child');
            expect(res.status).toEqual(200);
            expect(tags).toEqual({ region: 'us', role: 'admin' });
        });

        it('should allow route level middleware', async () => {
            let counter = 0;
            app = await createApp({
                id: '/',
                app: {
                    routing: {
                        routes: () => [
                            {
                                method: 'get',
                                path: '/',
                                middleware: [
                                    (_req, _res, next) => {
                                        counter++;
                                        next();
                                    }
                                ],
                                handler: async () => ok()
                            }
                        ]
                    }
                }
            });

            let res = await agent.get('/');
            expect(res.status).toEqual(200);
            expect(counter).toBe(1);
        });
    });
});
