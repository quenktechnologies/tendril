import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { ActionM, Request, next, show } from '../../../../../../../src/app/api';
import { forbidden } from '../../../../../../../src/app/api/http';

const reports = ['expense', 'income', 'assets'];

export const modify = (r: Request): Future<ActionM<undefined>> => {

    r.params['report'] = r.params['report'].split('x').join('');
console.error('well look dry backanal          ', r.params['report']);
  return pure(next(r));

}

export const isReport = (r: Request): Future<ActionM<undefined>> => {
  console.error(`is r.params ${r.params['report']}`);
  return    (reports.indexOf(r.params['report']) > -1) ?
        pure(next(r)) :
    pure(forbidden());

}

export const quickShow = (r: Request): Future<ActionM<undefined>> => {
    console.error(`going to quickly show ${r.params['report']} becuse we can !`)
    return pure((r.params['report'] === 'income') ? show('income') : next(r));

}

