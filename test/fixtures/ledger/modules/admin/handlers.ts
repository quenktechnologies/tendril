import * as prs from '../../../../../lib/app/api/action/storage/prs';

import { raise } from '@quenk/noni/lib/control/monad/future';

import {
    Response,
    ask,
    tell
} from '../../../../../src/app/api/action/control/actor';
import { Disable, Enable, Redirect } from '../../../../../src/app/module';
import { await, next } from '../../../../../src/app/api/action/control';
import { ActionM } from '../../../../../src/app/api/action';
import { Request } from '../../../../../src/app/api/request';
import { ok, forbidden } from '../../../../../src/app/api/action/response';
import { header } from '../../../../../src/app/api/action/response';

export const disable = (_: Request): ActionM<undefined> =>
    (tell('/accounts', new Disable())
        .chain(() => ok()));

export const enable = (_: Request): ActionM<undefined> =>
    (tell('/accounts', new Enable())
        .chain(() => ok()));

export const redirect = (_: Request): ActionM<undefined> =>
    (tell('/accounts', new Redirect(301, 'localhost:8888'))
        .chain(() => ok()));

export const ping = (_: Request): ActionM<undefined> =>
    (ask<Response<string>>('/pong', 'ping').chain(r => ok(r)));

export const xheaders = (_: Request): ActionM<undefined> =>
    header({
        'x-powered-by': 'Thanos',
        'x-men': 'wolverine;storm;roll',
        'x-mega': 'zero'
    })
        .chain(() => ok());

export const crash = (_: Request): ActionM<undefined> =>
    await(() => raise(Error('crashed!')));

export const saveNum = (r: Request): ActionM<undefined> => {

    if (r.session) {

        r.session.num = r.body.num;
        console.error('saving ', r.session.num);
        return ok();

    } else {

        return forbidden();

    }

}

export const getNum = (r: Request): ActionM<undefined> => {

    if (r.session)
        return ok({ num: r.session.num || 0 });
    else
        return forbidden();

}

export const prsSet = (r: Request): ActionM<undefined> =>
    prs
        .set('value', 1)
        .chain(() => next(r));

export const prsGet = (r: Request): ActionM<undefined> =>
    prs
        .get('value')
        .chain(v => (v.get() === 1) ? next(r) : forbidden());

export const prsExists = (r: Request): ActionM<undefined> =>
    prs
        .exists('value')
        .chain(b => b ? next(r) : forbidden());

export const prsRemove = (_: Request): ActionM<undefined> =>
    prs
        .remove('value')
        .chain(() => prs.get('value'))
        .chain(m => m.isNothing() ? ok() : forbidden());
