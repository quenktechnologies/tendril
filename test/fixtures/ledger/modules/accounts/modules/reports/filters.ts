import { ActionM } from '../../../../../../../src/app/api/action';
import { Request } from '../../../../../../../src/app/api/request';
import { next } from '../../../../../../../src/app/api/action/next';
import { show } from '../../../../../../../src/app/api/action/show';
import { forbidden } from '../../../../../../../src/app/api/action/response';

const reports = ['expense', 'income', 'assets'];

export const modify = (r: Request): ActionM<undefined> => {

    r.params['report'] = r.params['report'].split('x').join('');
    return next(r);

}

export const isReport = (r: Request): ActionM<undefined> =>
    (reports.indexOf(r.params['report']) > -1) ?
        (next(r)) :
        (forbidden());

export const quickShow = (r: Request): ActionM<undefined> =>
    ((r.params['report'] === 'income') ? show('income') : next(r));


