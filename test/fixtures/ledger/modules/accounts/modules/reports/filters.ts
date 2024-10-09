import { Action } from '../../../../../../../src/app/api';
import { Request } from '../../../../../../../src/app/api/request';
import { next } from '../../../../../../../src/app/api/control';
import { forbidden, show } from '../../../../../../../src/app/api/response';

const reports = ['expense', 'income', 'assets'];

export const modify = (r: Request): Action<undefined> => {
    r.params['report'] = r.params['report'].split('x').join('');
    return next(r);
};

export const isReport = (r: Request): Action<undefined> =>
    reports.indexOf(r.params['report']) > -1 ? next(r) : forbidden();

export const quickShow = (r: Request): Action<undefined> =>
    r.params['report'] === 'income' ? show('income') : next(r);
