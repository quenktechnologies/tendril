import * as express from 'express';

import { ok } from '../../lib/app/api/response';
import { App } from '../..//lib/app';
import { createApp } from './fixtures/app';
import { createAgent } from './fixtures/agent';
import { RequestContext } from '../../lib/app/api/request';
import { expect } from '@jest/globals';

let token = '';

//TODO: Actually read from PRS when supported.
const fromPRS = async (_r: RequestContext) =>
    ok()//r.framework.request.csrfToken());

let app: App | undefined;

xdescribe('csrf-token', () => {
    beforeEach(async () => {
        app = await createApp({
            id: '/',

            app: {
                session: {
                    enable: true
                },

                csrf: {
                    enable: true
                },

                middleware: {
                    available: {
                        capture: {
                            provider:
                                () =>
                                (
                                    req: express.Request,
                                    _: express.Response,
                                    next: express.NextFunction
                                ) => {
                                    token = (<{ csrfToken: Function }>(
                                        (<object>req)
                                    )).csrfToken();
                                    next();
                                }
                        }
                    },

                    enabled: ['capture']
                },

                routing: {
                    routes: () => [
                        {
                            method: 'get',
                            path: '/prs',
                            filters: [fromPRS],
                            tags: {}
                        }
                    ]
                }
            },

            modules: {
                child0: {
                    app: {
                        routing: {
                            routes: () => [
                                {
                                    method: 'get',
                                    path: '/prs',
                                    filters: [fromPRS],
                                    tags: {}
                                }
                            ]
                        }
                    }
                }
            }
        });
    });

    afterEach(async () => {
        if (app) await app.stop();
        app = undefined;
    });

    it('should provide the current csrf token via PRS', async () => {
        let agent = createAgent();
        let res = await agent.get('/prs', {});
        expect(JSON.parse(String(res.body))).toBe(token);
    });

    it('should provide the PRS token if child does not enable csrf', async () => {
        let agent = createAgent();
        let res = await agent.get('/child0/prs', {});
        expect(JSON.parse(String(res.body))).toBe(token);
    });
});
