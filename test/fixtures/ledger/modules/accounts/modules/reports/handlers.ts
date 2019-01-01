import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { ActionM  } from '../../../../../../../src/app/api/action';
import { Request  } from '../../../../../../../src/app/api/request';
import {  show } from '../../../../../../../src/app/api/action/show';

export const generate = (_: Request): Future<ActionM<undefined>> =>
    pure(show('reports'));
