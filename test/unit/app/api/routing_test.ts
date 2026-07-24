import { assert } from '@quenk/test/lib/assert';
import { Type } from '@quenk/noni/lib/data/type';

import {
    Get,
    Post,
    Put,
    Patch,
    Delete,
    DecoratedRouteController,
    getRouteConfFromMetadata
} from '../../../../lib/app/api/routing';
import { RequestContext } from '../../../../lib/app/api/request';
import { Response, ok } from '../../../../lib/app/api/response';

const noop = async (_ctx: RequestContext): Promise<Response> => ok();
const preFilter = async (_ctx: RequestContext): Promise<void> => {};
const mw = () => {};

// Declaration merge: tells TypeScript MockDecoratedRouteController satisfies
// DecoratedRouteController without emitting any field initializer that would
// overwrite the Map set by addInitializer at construction time.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface MockDecoratedRouteController extends DecoratedRouteController {}
class MockDecoratedRouteController {
    value = 42;

    @Get('/users')
    list(_ctx: RequestContext) {
        return noop(_ctx);
    }

    @Post('/users')
    create(_ctx: RequestContext) {
        return noop(_ctx);
    }

    @Put('/users/:id')
    update(_ctx: RequestContext) {
        return noop(_ctx);
    }

    @Patch('/users/:id')
    patch(_ctx: RequestContext) {
        return noop(_ctx);
    }

    @Delete('/users/:id')
    remove(_ctx: RequestContext) {
        return noop(_ctx);
    }

    @Get('/filtered', { filters: [preFilter] })
    withFilters(_ctx: RequestContext) {
        return noop(_ctx);
    }

    @Get('/tagged', { tags: { role: 'admin', status: 200 } })
    withTags(_ctx: RequestContext) {
        return noop(_ctx);
    }

    @Get('/with-middleware', { middleware: [mw as Type] })
    withMiddleware(_ctx: RequestContext) {
        return noop(_ctx);
    }

    @Get('/value')
    async getValue(_ctx: RequestContext): Promise<Response> {
        assert(this.value).equal(42);
        return ok();
    }
}

describe('routing', () => {
    describe('decorators', () => {
        it('@Get registers a GET route at the given path', () => {
            const routes = getRouteConfFromMetadata(
                new MockDecoratedRouteController()
            );
            assert(
                routes.some(r => r.method === 'get' && r.path === '/users')
            ).true();
        });

        it('@Post registers a POST route at the given path', () => {
            const routes = getRouteConfFromMetadata(
                new MockDecoratedRouteController()
            );
            assert(
                routes.some(r => r.method === 'post' && r.path === '/users')
            ).true();
        });

        it('@Put registers a PUT route at the given path', () => {
            const routes = getRouteConfFromMetadata(
                new MockDecoratedRouteController()
            );
            assert(
                routes.some(r => r.method === 'put' && r.path === '/users/:id')
            ).true();
        });

        it('@Patch registers a PATCH route at the given path', () => {
            const routes = getRouteConfFromMetadata(
                new MockDecoratedRouteController()
            );
            assert(
                routes.some(
                    r => r.method === 'patch' && r.path === '/users/:id'
                )
            ).true();
        });

        it('@Delete registers a DELETE route at the given path', () => {
            const routes = getRouteConfFromMetadata(
                new MockDecoratedRouteController()
            );
            assert(
                routes.some(
                    r => r.method === 'delete' && r.path === '/users/:id'
                )
            ).true();
        });

        it('stores pre-filters in the route from RouteDecoratorOptions', () => {
            const route = getRouteConfFromMetadata(
                new MockDecoratedRouteController()
            ).find(r => r.path === '/filtered');
            assert(route?.filters?.length).equal(1);
            assert(route?.filters?.[0]).equal(preFilter);
        });

        it('stores tags in the route from RouteDecoratorOptions', () => {
            const route = getRouteConfFromMetadata(
                new MockDecoratedRouteController()
            ).find(r => r.path === '/tagged');
            assert((route?.tags as Type).role).equal('admin');
        });

        it('stores middleware in the route from RouteDecoratorOptions', () => {
            const route = getRouteConfFromMetadata(
                new MockDecoratedRouteController()
            ).find(r => r.path === '/with-middleware');
            assert(route?.middleware).equate([mw]);
        });

        it('registers all decorated methods as separate routes', () => {
            const routes = getRouteConfFromMetadata(
                new MockDecoratedRouteController()
            );
            assert(routes.length).equal(9);
        });
    });

    describe('getRouteConfFromMetadata', () => {
        it('returns an empty array for an undecorated instance', () => {
            interface C extends DecoratedRouteController {}
            class C {}
            assert(getRouteConfFromMetadata(new C()).length).equal(0);
        });

        it('does not set filters when none are given', () => {
            const route = getRouteConfFromMetadata(
                new MockDecoratedRouteController()
            ).find(r => r.path === '/users' && r.method === 'get');
            assert(route?.filters).undefined();
        });

        it('binds the handler to the instance', async () => {
            const instance = new MockDecoratedRouteController();
            const route = getRouteConfFromMetadata(instance).find(
                r => r.path === '/value'
            );
            await route!.handler(<Type>{});
        });

        it('replaces a route when the same method+path is re-declared', () => {
            interface C extends DecoratedRouteController {}
            class C {
                @Get('/ping')
                ping(_ctx: RequestContext) {
                    return noop(_ctx);
                }

                @Get('/ping')
                pingV2(_ctx: RequestContext) {
                    return noop(_ctx);
                }
            }

            const routes = getRouteConfFromMetadata(new C());
            assert(routes.length).equal(1);
            assert(routes[0].path).equal('/ping');
        });
    });
});
