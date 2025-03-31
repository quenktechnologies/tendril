import { expect, jest } from '@jest/globals';

import { MemoryStore } from 'express-session';

import { App } from '../../lib/app';
import { createApp } from './fixtures/app';
import { ok } from '../../lib/app/api/response';
import { RequestContext } from '../../lib/app/api/request';
import { createAgent } from './fixtures/agent';

const agent = createAgent();

let app: App | undefined;

describe('session', () => {
    afterEach(async () => {
        if (app) await app.stop();
        app = undefined;
    });

    describe('TTL', () => {
        it('should decrement values on each request', async () => {
            app = await createApp({
                app: {
                    log: {
                        enable: true
                    },
                    session: {
                        enable: true
                    },

                    routing: {
                        routes: () => [
                            {
                                method: 'get',
                                path: '/value',
                                filters: [
                                    async ({
                                        request: { session }
                                    }: RequestContext) =>
                                        ok(session.getOrElse('value', '?'))
                                ],
                                tags: {}
                            },
                            {
                                method: 'put',
                                path: '/value',
                                filters: [
                                    async ({
                                        request: { session }
                                    }: RequestContext) => {
                                        session.setWithDescriptor(
                                            'value',
                                            'foo',
                                            { ttl: 3 }
                                        );
                                        return ok();
                                    }
                                ],
                                tags: {}
                            },
                            {
                                method: 'get',
                                path: '/status',
                                filters: [async () => ok()],
                                tags: {}
                            }
                        ]
                    }
                }
            });

            let res = await agent.put('/value');
            expect(res.code).toBe(200);

            // 3
            res = await agent.get('/value');
            expect(res.code).toBe(200);
            expect(res.body).toBe('foo');

            // 2
            await agent.get('/status');
            expect(res.code).toBe(200);

            // 1
            res = await agent.get('/value');
            expect(res.code).toBe(200);
            expect(res.body).toBe('foo');

            res = await agent.get('/value', {});
            expect(res.code).toBe(200);
            expect(res.body).toBe('?');
        });

        it('should use the configured connection as a store', async () => {
            let store = new MemoryStore();
            let setSpy = jest.spyOn(store, 'set');
            let getSpy = jest.spyOn(store, 'get');

            let connection = {
                async open() {},

                async get() {
                    return store;
                },

                async close() {}
            };

            app = await createApp({
                app: {
                    connections: {
                        session: {
                            provider: () => connection
                        }
                    },
                    session: {
                        enable: true,
                        store: { connection: 'session' }
                    },

                    routing: {
                        routes: () => [
                            {
                                method: 'get',
                                path: '/value',
                                filters: [
                                    async ({
                                        request: { session }
                                    }: RequestContext) =>
                                        ok(session.getOrElse('value', '?'))
                                ],
                                tags: {}
                            },
                            {
                                method: 'put',
                                path: '/value',
                                filters: [
                                    async ({
                                        request: { session }
                                    }: RequestContext) => {
                                        session.set('value', 'foo');
                                        return ok();
                                    }
                                ],
                                tags: {}
                            }
                        ]
                    }
                }
            });

            let res = await agent.put('/value');
            expect(setSpy).toHaveBeenCalled();
            expect(res.code).toBe(200);

            res = await agent.get('/value');
            expect(res.code).toBe(200);
            expect(getSpy).toHaveBeenCalled();
        });
    });
});
