import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { ActionM, Request, next, show } from '../../../../../../../src/app/api';
import { forbidden } from '../../../../../../../src/app/api/http';

const reports = ['expense', 'income', 'assets'];

export const modify = (r: Request): Future<ActionM<undefined>> => {

    r.params['report'] = r.params['report'].split('x').join('');
  return pure(next(r));

}

export const isReport = (r: Request): Future<ActionM<undefined>> => 
      (reports.indexOf(r.params['report']) > -1) ?
        pure(next(r)) :
    pure(forbidden());

export const quickShow = (r: Request): Future<ActionM<undefined>> => 
     pure((r.params['report'] === 'income') ? show('income') : next(r));


