import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { ActionM, show } from '../../../../../../../src/app/api';

export const generate = (_: Request): Future<ActionM<undefined>> =>
    pure(show('reports'));
