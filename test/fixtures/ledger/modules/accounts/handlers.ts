import * as pool from '../../../../../src/app/api/pool';
import { Object } from '@quenk/noni/lib/data/json';
import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { Request, ActionM, wait } from '../../../../../src/app/api';
import { created } from '../../../../../src/app/api/http';
import { Memgo } from '../../../memgodb';

export const create = (r: Request): Future<ActionM<undefined>> =>
        pure(pool
            .checkout<Memgo>('main')
            .chain(m => wait(doCreate('account', r.body, m))));

const doCreate = (name: string, body: Object, m: Memgo): Future<ActionM<undefined>> =>
    m.collection(name)
        .insert(body)
        .chain(id => pure(created({ id })));
