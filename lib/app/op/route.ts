import * as log from '@quenk/potoo/lib/actor/system/log';
import * as express from 'express';
import * as codes from './';
import { Op } from '@quenk/potoo/lib/actor/system/op';
import { Address } from '@quenk/potoo/lib/actor/address';
import { Context, getModule } from '../state/context';
import { Filter, Context as RequestContext } from '../api';
import { Module } from '../module';
import { App } from '../';

/**
 * SupportedMethod
 */
export type SupportedMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * Route instructs the App to install a new route
 * for a module.
 */
export class Route<A> extends Op<Context> {

    constructor(
        public module: Address,
        public method: SupportedMethod,
        public path: string,
        public filters: Filter<A>[]) { super(); }

    code = codes.OP_ROUTE;

    level = log.INFO;

    exec(app: App): void {

        return getModule(app.state, this.module)
            .map(m => {

                switch (this.method) {

                    case 'get':
                        m.app.get(this.path, dispatch(this, m.module));
                        break;

                    case 'post':
                        m.app.post(this.path, dispatch(this, m.module));
                        break;

                    case 'put':
                        m.app.put(this.path, dispatch(this, m.module));
                        break;

                    case 'patch':
                        m.app.patch(this.path, dispatch(this, m.module));
                        break;

                    case 'delete':
                        m.app.delete(this.path, dispatch(this, m.module));
                        break;

                }

            })
            .get();

    }

}

const dispatch =
    <A>(r: Route<A>, m: Module) =>
        (req: express.Request, res: express.Response) =>
            new RequestContext(m, req, res, r.filters.slice()).run();
