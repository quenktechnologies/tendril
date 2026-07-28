import { assert } from '@quenk/test/lib/assert';
import { Type } from '@quenk/noni/lib/data/type';
import { Value } from '@quenk/noni/lib/data/jsonx';
import { Record } from '@quenk/noni/lib/data/record';

import {
    mkRequestMessage,
    GetParam,
    GetQuery,
    GetBody,
    GetRequest,
    GetApp,
    GetModule,
    GetActor,
    GetFramework,
    RequestContext,
    RequestMessage
} from '../../../../lib/app/api/request';

const mkCtx = (request: Partial<RequestMessage>): RequestContext =>
    <RequestContext>(<unknown>{ request });

const mkFullCtx = (ctx: Partial<RequestContext>): RequestContext =>
    <RequestContext>(<unknown>ctx);

describe('request', () => {
    describe('mkRequestMessage', () => {
        it('should proxy values to prs', () => {
            let request = <Type>{
                method: 'GET',
                path: '/',
                url: '/',
                params: {},
                query: {},
                body: undefined,
                cookies: {},
                hostname: 'localhost',
                ip: '127.0.0.1',
                protocol: 'http'
            };

            let response = <Type>{};
            let msg = mkRequestMessage(request, response);

            assert(msg.values).equal(msg.prs.values);

            (<Type>msg.values).level = 12;

            assert(msg.prs.get('level').isJust()).true();
            assert(msg.prs.get('level').get()).equal(12);
            assert((<Type>msg.values).level).equal(12);

            msg.prs.set('mode', 'test');

            assert((<Type>msg.values).mode).equal('test');
        });
    });

    describe('GetParam', () => {
        it('provides the entire params object when no path is given', () => {
            class C {
                @GetParam()
                method(_ctx: RequestContext, params: Record<string>) {
                    return params;
                }
            }

            let result = (
                new C().method as (ctx: RequestContext) => Record<string>
            )(mkCtx({ params: { id: '1' } }));
            assert(result).equate({ id: '1' });
        });

        it('extracts a value at the given path', () => {
            class C {
                @GetParam('id')
                method(_ctx: RequestContext, id: string) {
                    return id;
                }
            }
            let result = (new C().method as (ctx: RequestContext) => string)(
                mkCtx({ params: { id: '42' } })
            );
            assert(result).equal('42');
        });

        it('provides undefined when the path is not found', () => {
            class C {
                @GetParam('missing')
                method(_ctx: RequestContext, value: Value) {
                    return value;
                }
            }
            let result = (new C().method as (ctx: RequestContext) => Value)(
                mkCtx({ params: {} })
            );
            assert(result).undefined();
        });
    });

    describe('GetQuery', () => {
        it('provides the entire query object when no path is given', () => {
            class C {
                @GetQuery()
                method(_ctx: RequestContext, query: Record<string>) {
                    return query;
                }
            }
            let result = (
                new C().method as (ctx: RequestContext) => Record<string>
            )(mkCtx({ query: { sort: 'asc' } }));
            assert(result).equate({ sort: 'asc' });
        });

        it('extracts a value at the given path', () => {
            class C {
                @GetQuery('sort')
                method(_ctx: RequestContext, sort: string) {
                    return sort;
                }
            }
            let result = (new C().method as (ctx: RequestContext) => string)(
                mkCtx({ query: { sort: 'asc' } })
            );
            assert(result).equal('asc');
        });
    });

    describe('GetBody', () => {
        it('provides the entire body when no path is given', () => {
            class C {
                @GetBody()
                method(_ctx: RequestContext, body: Record<string>) {
                    return body;
                }
            }
            let result = (
                new C().method as (ctx: RequestContext) => Record<string>
            )(mkCtx({ body: { name: 'bob' } }));
            assert(result).equate({ name: 'bob' });
        });

        it('extracts a value at the given path', () => {
            class C {
                @GetBody('name')
                method(_ctx: RequestContext, name: string) {
                    return name;
                }
            }
            let result = (new C().method as (ctx: RequestContext) => string)(
                mkCtx({ body: { name: 'bob' } })
            );
            assert(result).equal('bob');
        });

        it('extracts a value at a nested path', () => {
            class C {
                @GetBody('user.name')
                method(_ctx: RequestContext, name: string) {
                    return name;
                }
            }
            let result = (new C().method as (ctx: RequestContext) => string)(
                mkCtx({ body: { user: { name: 'bob' } } })
            );
            assert(result).equal('bob');
        });
    });

    describe('GetRequest', () => {
        it('provides the entire RequestMessage when no path is given', () => {
            class C {
                @GetRequest()
                method(_ctx: RequestContext, request: RequestMessage) {
                    return request;
                }
            }
            let request = <Type>{ method: 'GET' };
            let result = (
                new C().method as (ctx: RequestContext) => RequestMessage
            )(mkFullCtx({ request }));
            assert(result).equal(request);
        });

        it('extracts a value at the given path', () => {
            class C {
                @GetRequest('method')
                method(_ctx: RequestContext, method: string) {
                    return method;
                }
            }
            let result = (new C().method as (ctx: RequestContext) => string)(
                mkFullCtx({ request: <Type>{ method: 'GET' } })
            );
            assert(result).equal('GET');
        });
    });

    describe('GetApp', () => {
        it('provides the entire App instance when no path is given', () => {
            class C {
                @GetApp()
                method(_ctx: RequestContext, app: Type) {
                    return app;
                }
            }
            let app = <Type>{ name: 'test-app' };
            let result = (new C().method as (ctx: RequestContext) => Type)(
                mkFullCtx({ app })
            );
            assert(result).equal(app);
        });

        it('extracts a value at the given path', () => {
            class C {
                @GetApp('name')
                method(_ctx: RequestContext, name: string) {
                    return name;
                }
            }
            let result = (new C().method as (ctx: RequestContext) => string)(
                mkFullCtx({ app: <Type>{ name: 'test-app' } })
            );
            assert(result).equal('test-app');
        });
    });

    describe('GetModule', () => {
        it('provides the entire ModuleInfo when no path is given', () => {
            class C {
                @GetModule()
                method(_ctx: RequestContext, module: Type) {
                    return module;
                }
            }
            let module = <Type>{ id: 'mod-1' };
            let result = (new C().method as (ctx: RequestContext) => Type)(
                mkFullCtx({ module })
            );
            assert(result).equal(module);
        });

        it('extracts a value at the given path', () => {
            class C {
                @GetModule('id')
                method(_ctx: RequestContext, id: string) {
                    return id;
                }
            }
            let result = (new C().method as (ctx: RequestContext) => string)(
                mkFullCtx({ module: <Type>{ id: 'mod-1' } })
            );
            assert(result).equal('mod-1');
        });
    });

    describe('GetActor', () => {
        it('provides the entire actor when no path is given', () => {
            class C {
                @GetActor()
                method(_ctx: RequestContext, actor: Type) {
                    return actor;
                }
            }
            let actor = <Type>{ id: 'actor-1' };
            let result = (new C().method as (ctx: RequestContext) => Type)(
                mkFullCtx({ actor })
            );
            assert(result).equal(actor);
        });
    });

    describe('GetFramework', () => {
        it('provides the entire FrameworkRequest when no path is given', () => {
            class C {
                @GetFramework()
                method(_ctx: RequestContext, framework: Type) {
                    return framework;
                }
            }
            let framework = <Type>{ request: {}, response: {} };
            let result = (new C().method as (ctx: RequestContext) => Type)(
                mkFullCtx({ framework })
            );
            assert(result).equal(framework);
        });

        it('extracts a value at the given path', () => {
            class C {
                @GetFramework('request')
                method(_ctx: RequestContext, request: Type) {
                    return request;
                }
            }
            let request = <Type>{ headers: {} };
            let result = (new C().method as (ctx: RequestContext) => Type)(
                mkFullCtx({ framework: <Type>{ request, response: {} } })
            );
            assert(result).equal(request);
        });
    });

    describe('composing GetParam, GetQuery and GetBody', () => {
        it('appends each extracted value in declaration order', () => {
            class C {
                @GetParam('id')
                @GetQuery('sort')
                @GetBody('name')
                method(
                    _ctx: RequestContext,
                    id: string,
                    sort: string,
                    name: string
                ) {
                    return { id, sort, name };
                }
            }
            let result = (
                new C().method as (ctx: RequestContext) => {
                    id: string;
                    sort: string;
                    name: string;
                }
            )(
                mkCtx({
                    params: { id: '1' },
                    query: { sort: 'asc' },
                    body: { name: 'bob' }
                })
            );
            assert(result).equate({ id: '1', sort: 'asc', name: 'bob' });
        });
    });
});
