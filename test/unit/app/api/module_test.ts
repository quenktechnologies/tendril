import { Type } from '@quenk/noni/lib/data/type';

import {
    Module,
    MODULE_METADATA_KEY,
    getModuleConfFromMetadata,
    DecoratedModuleController
} from '../../../../lib/app/api/module';
import { Get, Post } from '../../../../lib/app/api/routing';
import { Tags } from '../../../../lib/app/api/tag';
import { RequestContext } from '../../../../lib/app/api/request';
import { Response, ok } from '../../../../lib/app/api/response';
import { RouteConf } from '../../../../lib/app/conf';

const noop = async (_ctx: RequestContext): Promise<Response> => ok();

describe('module', () => {
    describe('@Module', () => {
        it('should store an empty object when called with no arguments', () => {
            @Module()
            class C {}

            expect((C as Type)[MODULE_METADATA_KEY]).toEqual({});
        });

        it('should store the full conf shape when provided', () => {
            @Module({ disabled: true, app: { path: '/api' } })
            class C {}

            expect((C as Type)[MODULE_METADATA_KEY]).toEqual({
                disabled: true,
                app: { path: '/api' }
            });
        });

        it('should not store metadata on undecorated classes', () => {
            class C {}
            expect((C as Type)[MODULE_METADATA_KEY]).toBeUndefined();
        });

        it('should not store metadata on plain objects', () => {
            expect(({} as Type)[MODULE_METADATA_KEY]).toBeUndefined();
        });
    });

    describe('getModuleConfFromMetadata', () => {
        it('should return the ModuleConf when passed an instance', () => {
            const opts = { app: { path: '/users' } };
            @Module(opts)
            class C {}

            const conf = getModuleConfFromMetadata(
                new C() as unknown as DecoratedModuleController
            );
            expect(conf).toMatchObject(opts);
        });

        it('should include explicit routes from @Module conf when passed an instance', () => {
            @Module({
                app: {
                    routing: {
                        routes: () => [
                            { method: 'get', path: '/explicit', handler: noop }
                        ]
                    }
                }
            })
            class C {}

            const conf = getModuleConfFromMetadata(
                new C() as unknown as DecoratedModuleController
            );
            const routes = conf.app?.routing?.routes?.({} as Type);
            expect(routes?.length).toBe(1);
            expect(routes?.[0].path).toBe('/explicit');
        });

        it('should return routes from decorated instance methods when passed an instance', () => {
            class C {
                @Get('/items')
                list(_ctx: RequestContext) {
                    return noop(_ctx);
                }
            }

            const conf = getModuleConfFromMetadata(
                new C() as unknown as DecoratedModuleController
            );
            const routes = conf.app?.routing?.routes?.({} as Type);
            expect(routes?.length).toBe(1);
            expect(routes?.[0].method).toBe('get');
            expect(routes?.[0].path).toBe('/items');
        });

        it('should combine decorated and routes', () => {
            @Module({
                app: {
                    routing: {
                        routes: () => [
                            { method: 'get', path: '/explicit', handler: noop }
                        ]
                    }
                }
            })
            class C {
                @Get('/items')
                list(_ctx: RequestContext) {
                    return noop(_ctx);
                }

                @Post('/items')
                create(_ctx: RequestContext) {
                    return noop(_ctx);
                }
            }

            const conf = getModuleConfFromMetadata(
                new C() as unknown as DecoratedModuleController
            );
            const routes = conf.app?.routing?.routes?.(
                {} as Type
            ) as RouteConf[];
            expect(routes.length).toBe(3);

            expect(routes[0].method === 'get').toBe(true);
            expect(routes[0].path === '/explicit').toBe(true);

            expect(routes[1].method === 'get').toBe(true);
            expect(routes[1].path === '/items').toBe(true);

            expect(routes[2].method === 'post').toBe(true);
            expect(routes[2].path === '/items').toBe(true);
        });

        it('should merge tags from @Tags into the module tags', () => {
            @Tags({ area: 'admin' })
            @Module()
            class C {}

            const conf = getModuleConfFromMetadata(
                new C() as unknown as DecoratedModuleController
            );
            expect(conf.app?.tags).toEqual({ area: 'admin' });
        });

        it("should let @Module's own tags take precedence over @Tags on conflict", () => {
            @Tags({ area: 'admin', role: 'guest' })
            @Module({ app: { tags: { role: 'owner' } } })
            class C {}

            const conf = getModuleConfFromMetadata(
                new C() as unknown as DecoratedModuleController
            );
            expect(conf.app?.tags).toEqual({ area: 'admin', role: 'owner' });
        });

        it('should merge tags when @Tags is applied to a class more than once', () => {
            @Tags({ role: 'owner' })
            @Tags({ area: 'admin', role: 'guest' })
            @Module()
            class C {}

            const conf = getModuleConfFromMetadata(
                new C() as unknown as DecoratedModuleController
            );
            expect(conf.app?.tags).toEqual({ area: 'admin', role: 'owner' });
        });
    });
});
