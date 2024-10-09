import * as pool from '../../../../../src/app/api/pool';

import { Object } from '@quenk/noni/lib/data/jsonx';
import { Future } from '@quenk/noni/lib/control/monad/future';

import { Request } from '../../../../../src/app/api/request';
import { Action } from '../../../../../src/app/api';
import { fork, value, next } from '../../../../../src/app/api/control';
import { created } from '../../../../../src/app/api/response';
import { Memgo } from '../../../memgodb';

export const create = (r: Request): Action<undefined> =>
    pool
        .checkout<Memgo>('main')
        .chain(m => fork(doCreate('account', <Object>r.body, m)))
        .chain(id => value(created({ id })))
        .chain(r => r);

const doCreate = (name: string, body: Object, m: Memgo): Future<number> =>
    m.collection(name).insert(body);

export const setModuleFiltersWorks = (_: Request): Action<undefined> => {
    process.env.MODULE_FILTERS_WORK = 'yes';

    return next(_);
};
