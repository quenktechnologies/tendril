import { Type } from '@quenk/noni/lib/data/type';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Either } from '@quenk/noni/lib/data/either';

import {
    Get,
    Post,
    Put,
    Patch,
    Delete,
    fromMetadata
} from '../../../../lib/app/api/routing';
import {
    RequestContext,
    Param,
    Query,
    Body
} from '../../../../lib/app/api/request';
import {
    Response,
    ok,
    OK,
    CREATED,
    NOT_FOUND,
    CONFLICT,
    INTERNAL_SERVER_ERROR
} from '../../../../lib/app/api/response';

const noop = async (_ctx: RequestContext): Promise<Response> => ok();
const preFilter = async (_ctx: RequestContext): Promise<void> => {};
const mw = () => {};

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
        expect(this.value).toBe(42);
        return ok();
    }
}

class DispatchHandlerController {
    @Get('/response')
    response(_ctx: RequestContext) {
        return ok({ id: 3 });
    }

    @Get('/plain')
    async plain(_ctx: RequestContext) {
        return { id: 1 };
    }

    @Get('/plain-status', { status: CREATED })
    async plainStatus(_ctx: RequestContext) {
        return { id: 2 };
    }

    @Get('/just')
    async just(_ctx: RequestContext) {
        return Maybe.just({ id: 4 });
    }

    @Get('/nothing')
    async nothing(_ctx: RequestContext) {
        return Maybe.nothing();
    }

    @Get('/right')
    async right(_ctx: RequestContext) {
        return Either.right({ id: 5 });
    }

    @Get('/left')
    async left(_ctx: RequestContext) {
        return Either.left({ reason: 'conflict' });
    }

    @Get('/reject')
    async reject(_ctx: RequestContext) {
        throw new Error('boom');
    }

    @Get('/throw')
    async throwSync(_ctx: RequestContext) {
        throw new Error('kaboom');
    }
}

class ParamQueryBodyController {
    @Get('/users/:id')
    @Param('id')
    @Query('sort')
    @Body('name')
    async getUser(
        _ctx: RequestContext,
        id: string,
        sort: string,
        name: string
    ) {
        return { id, sort, name };
    }
}

describe('routing', () => {
    describe('decorators', () => {
        it('@Get registers a GET route at the given path', () => {
            let routes = fromMetadata(new MockDecoratedRouteController());
            expect(
                routes.some(r => r.method === 'get' && r.path === '/users')
            ).toBe(true);
        });

        it('@Post registers a POST route at the given path', () => {
            let routes = fromMetadata(new MockDecoratedRouteController());
            expect(
                routes.some(r => r.method === 'post' && r.path === '/users')
            ).toBe(true);
        });

        it('@Put registers a PUT route at the given path', () => {
            let routes = fromMetadata(new MockDecoratedRouteController());
            expect(
                routes.some(r => r.method === 'put' && r.path === '/users/:id')
            ).toBe(true);
        });

        it('@Patch registers a PATCH route at the given path', () => {
            let routes = fromMetadata(new MockDecoratedRouteController());
            expect(
                routes.some(
                    r => r.method === 'patch' && r.path === '/users/:id'
                )
            ).toBe(true);
        });

        it('@Delete registers a DELETE route at the given path', () => {
            let routes = fromMetadata(new MockDecoratedRouteController());
            expect(
                routes.some(
                    r => r.method === 'delete' && r.path === '/users/:id'
                )
            ).toBe(true);
        });

        it('stores pre-filters in the route from RouteDecoratorOptions', () => {
            let route = fromMetadata(new MockDecoratedRouteController()).find(
                r => r.path === '/filtered'
            );
            expect(route?.filters?.length).toBe(1);
            expect(route?.filters?.[0]).toBe(preFilter);
        });

        it('stores tags in the route from RouteDecoratorOptions', () => {
            let route = fromMetadata(new MockDecoratedRouteController()).find(
                r => r.path === '/tagged'
            );
            expect((route?.tags as Type).role).toBe('admin');
        });

        it('stores middleware in the route from RouteDecoratorOptions', () => {
            let route = fromMetadata(new MockDecoratedRouteController()).find(
                r => r.path === '/with-middleware'
            );
            expect(route?.middleware).toEqual([mw]);
        });

        it('registers all decorated methods as separate routes', () => {
            let routes = fromMetadata(new MockDecoratedRouteController());
            expect(routes.length).toBe(9);
        });
    });

    describe('fromMetadata', () => {
        it('returns an empty array for an undecorated instance', () => {
            class C {}
            expect(fromMetadata(new C()).length).toBe(0);
        });

        it('does not set filters when none are given', () => {
            let route = fromMetadata(new MockDecoratedRouteController()).find(
                r => r.path === '/users' && r.method === 'get'
            );
            expect(route?.filters).toBeUndefined();
        });

        it('binds the handler to the instance', async () => {
            let instance = new MockDecoratedRouteController();
            let route = fromMetadata(instance).find(r => r.path === '/value');
            await route!.handler(<Type>{});
        });

        it('replaces a route when the same method+path is re-declared', () => {
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

            let routes = fromMetadata(new C());
            expect(routes.length).toBe(1);
            expect(routes[0].path).toBe('/ping');
        });
    });

    describe('dispatchHandler', () => {
        let run = async (path: string): Promise<Response> => {
            let route = fromMetadata(new DispatchHandlerController()).find(
                r => r.path === path
            );
            return route!.handler(<Type>{});
        };

        it('passes a Response through unchanged', async () => {
            let res = await run('/response');
            expect(res.status).toBe(OK);
            expect(res.getBody()).toEqual({ id: 3 });
        });

        it('wraps a plain value at the default status', async () => {
            let res = await run('/plain');
            expect(res.status).toBe(OK);
            expect(res.getBody()).toEqual({ id: 1 });
        });

        it('wraps a plain value at the configured status', async () => {
            let res = await run('/plain-status');
            expect(res.status).toBe(CREATED);
            expect(res.getBody()).toEqual({ id: 2 });
        });

        it('sends the configured status with the value of a Just', async () => {
            let res = await run('/just');
            expect(res.status).toBe(OK);
            expect(res.getBody()).toEqual({ id: 4 });
        });

        it('sends 404 for a Nothing', async () => {
            let res = await run('/nothing');
            expect(res.status).toBe(NOT_FOUND);
        });

        it('sends the configured status with the value of a Right', async () => {
            let res = await run('/right');
            expect(res.status).toBe(OK);
            expect(res.getBody()).toEqual({ id: 5 });
        });

        it('sends 409 with the value of a Left', async () => {
            let res = await run('/left');
            expect(res.status).toBe(CONFLICT);
            expect(res.getBody()).toEqual({ reason: 'conflict' });
        });

        it('sends 500 when the handler rejects', async () => {
            let res = await run('/reject');
            expect(res.status).toBe(INTERNAL_SERVER_ERROR);
        });

        it('sends 500 when the handler throws synchronously', async () => {
            let res = await run('/throw');
            expect(res.status).toBe(INTERNAL_SERVER_ERROR);
        });
    });

    describe('Param, Query, Body integration', () => {
        it('composes with @Get and dispatchHandler', async () => {
            let route = fromMetadata(new ParamQueryBodyController()).find(
                r => r.path === '/users/:id'
            );

            let ctx = <RequestContext>(<unknown>{
                request: {
                    params: { id: '1' },
                    query: { sort: 'asc' },
                    body: { name: 'bob' }
                }
            });

            let res = await route!.handler(ctx);
            expect(res.status).toBe(OK);
            expect(res.getBody()).toEqual({
                id: '1',
                sort: 'asc',
                name: 'bob'
            });
        });
    });
});
