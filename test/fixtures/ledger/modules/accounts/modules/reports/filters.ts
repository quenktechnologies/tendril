import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { ActionM} from '../../../../../../../src/app/api/action';
import {  Request} from '../../../../../../../src/app/api/request';
import {  next  } from '../../../../../../../src/app/api/action/next';
import {  show } from '../../../../../../../src/app/api/action/show';
import { 
  forbidden 
} from '../../../../../../../src/app/api/action/http/response/forbidden';

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


