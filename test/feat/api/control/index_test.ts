import { assert } from '@quenk/test/lib/assert';

import { liftF } from '@quenk/noni/lib/control/monad/free';
import {
    toPromise,
    doFuture,
    attempt,
    pure,
    Future
} from '@quenk/noni/lib/control/monad/future';

import { ok } from '../../../../lib/app/api/response';
import { Module } from '../../../../lib/app/module';
import { doAction, Api, Context, Action } from '../../../../lib/app/api';
import { abort } from '../../../../lib/app/api/control';
import { App } from '../../../../lib/app';
import { createAgent } from '../../fixtures/agent';

process.env.PORT = '8888';

class Inc<A> extends Api<A> {

    constructor(public list: number[], public next: A) { super(next); }

    map<B>(f: (n: A) => B): Inc<B> {

        return new Inc(this.list, f(this.next));

    }

    exec(_: Context<A>): Future<A> {

        this.list.push(1);
        return pure(this.next);

    }

}

const inc = <A>(list: number[]): Action<A> => liftF(new Inc(list, undefined));

const doStop = (list: number[]) => () =>
    doAction<undefined>(function*() {

        yield inc(list);

        yield inc(list);

        yield ok();

        yield abort();

        yield inc(list);

        return ok();

    });

const doChainStop = (list: number[]) => () =>
    inc(list)
        .chain(() => inc(list))
        .chain(() => ok())
        .chain(() => abort())
        .chain(() => inc(list))
        .chain(() => ok());

describe('control', () => {

    let app: App;

    afterEach(() => toPromise(app.stop()));

    describe('abort', () => {

        it('should end execution of the Context\'s filter chain', () =>
            toPromise(doFuture<undefined>(function*() {

                let counter = <number[]>[];

                app = new App(() => ({

                    id: '/',

                    create: () => new Module(app),

                    server: {

                        host: 'localhost',

                        port: Number(process.env.PORT)

                    },

                    app: {

                        routes: () => [

                            {
                                method: 'get',
                                path: '/',
                                filters: [doStop(counter)]
                            }

                        ]
                    }
                }));

                yield app.start();

                let agent = createAgent();

                yield agent.get('/', {});

                yield attempt(() => {

                    assert(counter).equate([1, 1]);

                });

                return pure(undefined);

            })));

        it('should end execution of a filter chain', () =>
            toPromise(doFuture<undefined>(function*() {

                let counter = <number[]>[];

                app = new App(() => ({

                    id: '/',

                    create: () => new Module(app),

                    server: {

                        host: 'localhost',

                        port: Number(process.env.PORT)

                    },

                    app: {

                        routes: () => [

                            {
                                method: 'get',
                                path: '/',
                                filters: [doChainStop(counter)]
                            }

                        ]
                    }
                }));

                yield app.start();

                let agent = createAgent();

                yield agent.get('/', {});

                yield attempt(() => {

                    assert(counter).equate([1, 1]);

                });

                return pure(undefined);

            })));
    });
});
