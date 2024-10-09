import * as res from '../../../lib/app/api/response';
import { assert } from '@quenk/test/lib/assert';

import { Type } from '@quenk/noni/lib/data/type';
import { attempt, pure, Future } from '@quenk/noni/lib/control/monad/future';
import { liftF } from '@quenk/noni/lib/control/monad/free';

import { Request } from '../../../lib/app/api/request';
import { doAction, Api, Context, Action } from '../../../lib/app/api';
import { App } from '../../../lib/app';
import { createAgent } from '../fixtures/agent';

process.env.PORT = '8888';

let app: App;

class Inc<A> extends Api<A> {
    constructor(
        public list: number[],
        public next: A
    ) {
        super(next);
    }

    map<B>(f: (n: A) => B): Inc<B> {
        return new Inc(this.list, f(this.next));
    }

    exec(ctx: Context<A>): Future<A> {
        this.list.push(1);
        ctx.response.end();
        return <Future<A>>pure(this.next);
    }
}

const inc = (list: number[]): Action<undefined> =>
    liftF(new Inc(list, undefined));

const getFilter = (list: number[], f: Function) => (r: Request) =>
    doAction(function* () {
        yield f(r);

        return inc(list);
    });

const shouldAbort = (filter: Function, expect: number[]) =>
    Future.do(async () => {
        let list = <number[]>[];

        let doShow = (): Future<Type> =>
            pure({ type: 'text/plain', content: '' });

        app = new App(() => ({
            id: '/',

            server: {
                host: 'localhost',

                port: Number(process.env.PORT)
            },

            app: {
                views: {
                    provider: () => doShow
                },

                routes: () => [
                    {
                        method: 'get',
                        path: '/',
                        filters: [getFilter(list, filter)],
                        tags: {}
                    }
                ]
            }
        }));

        await app.start();

        let agent = createAgent();

        await agent.get('/', {});

        await attempt(() => assert(list).equate(expect));
    });

describe('response', () => {
    afterEach(() => app.stop());

    describe('show', () => {
        it('should end execution of the filter chain by default', () =>
            shouldAbort(res.show, []));

        it('should not end execution of the filter when told to', () =>
            shouldAbort(() => res.show('', {}, 200, false), [1]));
    });

    describe('accepted', () => {
        it('should end execution of the filter chain by default', () =>
            shouldAbort(() => res.accepted(), []));

        it('should not end execution of the filter when told to', () =>
            shouldAbort(() => res.accepted({}, false), [1]));
    });

    describe('badRequest', () => {
        it('should end execution of the filter chain by default', () =>
            shouldAbort(() => res.badRequest(), []));

        it('should not end execution of the filter when told to', () =>
            shouldAbort(() => res.badRequest({}, false), [1]));
    });

    describe('conflict', () => {
        it('should end execution of the filter chain by default', () =>
            shouldAbort(() => res.conflict(), []));

        it('should not end execution of the filter when told to', () =>
            shouldAbort(() => res.conflict({}, false), [1]));
    });

    describe('created', () => {
        it('should end execution of the filter chain by default', () =>
            shouldAbort(() => res.created(), []));

        it('should not end execution of the filter when told to', () =>
            shouldAbort(() => res.created({}, false), [1]));
    });

    describe('unauthorized', () => {
        it('should end execution of the filter chain by default', () =>
            shouldAbort(() => res.unauthorized(), []));

        it('should not end execution of the filter when told to', () =>
            shouldAbort(() => res.unauthorized({}, false), [1]));
    });

    describe('unauthorized', () => {
        it('should end execution of the filter chain by default', () =>
            shouldAbort(() => res.error(new Error()), []));

        it('should not end execution of the filter when told to', () =>
            shouldAbort(() => res.error(new Error(), false), [1]));
    });

    describe('forbidden', () => {
        it('should end execution of the filter chain by default', () =>
            shouldAbort(() => res.forbidden(), []));

        it('should not end execution of the filter when told to', () =>
            shouldAbort(() => res.forbidden({}, false), [1]));
    });

    describe('noContent', () => {
        it('should end execution of the filter chain by default', () =>
            shouldAbort(() => res.noContent(), []));

        it('should not end execution of the filter when told to', () =>
            shouldAbort(() => res.noContent(false), [1]));
    });

    describe('notFound', () => {
        it('should end execution of the filter chain by default', () =>
            shouldAbort(() => res.notFound(), []));

        it('should not end execution of the filter when told to', () =>
            shouldAbort(() => res.notFound({}, false), [1]));
    });

    describe('ok', () => {
        it('should end execution of the filter chain by default', () =>
            shouldAbort(() => res.ok(), []));

        it('should not end execution of the filter when told to', () =>
            shouldAbort(() => res.ok({}, false), [1]));
    });

    describe('redirect', () => {
        it('should end execution of the filter chain by default', () =>
            shouldAbort(() => res.redirect('/foo', 303), []));

        it('should not end execution of the filter when told to', () =>
            shouldAbort(() => res.redirect('/foo', 303, false), [1]));
    });
});
