import * as prs from '../../../../../lib/app/api/storage/prs';
import * as session from '../../../../../lib/app/api/storage/session';

import {Object} from '@quenk/noni/lib/data/jsonx';
import { raise } from '@quenk/noni/lib/control/monad/future';

import {
    Response,
    ask,
    tell
} from '../../../../../src/app/api/control/actor';
import { Disable, Enable, Redirect } from '../../../../../src/app/module';
import { fork, next } from '../../../../../src/app/api/control';
import { Action } from '../../../../../src/app/api';
import { Request } from '../../../../../src/app/api/request';
import { ok, forbidden, notFound } from '../../../../../src/app/api/response';
import { header } from '../../../../../src/app/api/response';

export const disable = (_: Request): Action<undefined> =>
    (tell('/accounts', new Disable())
        .chain(() => ok()));

export const enable = (_: Request): Action<undefined> =>
    (tell('/accounts', new Enable())
        .chain(() => ok()));

export const redirect = (_: Request): Action<undefined> =>
    (tell('/accounts', new Redirect(301, 'localhost:8888'))
        .chain(() => ok()));

export const ping = (_: Request): Action<undefined> =>
    (ask<Response<string>>('/pong', 'ping').chain(r => ok(r)));

export const xheaders = (_: Request): Action<undefined> =>
    header({
        'x-powered-by': 'Thanos',
        'x-men': 'wolverine;storm;roll',
        'x-mega': 'zero'
    })
        .chain(() => ok());

export const crash = (_: Request): Action<undefined> =>
    fork(raise(Error('crashed!')));

export const saveNum = (r: Request): Action<undefined> => {

    if (r.session.isEnabled()) {

        r.session.set('num', (<Object>r.body).num);
        return ok();

    } else {

        return forbidden();

    }

}

export const getNum = (r: Request): Action<undefined> => {

    if (r.session.isEnabled())
        return ok({ num: r.session.getOrElse('num', 0) });
    else
        return forbidden();

}

export const prsSet = (r: Request): Action<undefined> =>
    prs
        .set('value', 1)
        .chain(() => next(r));

export const prsGet = (r: Request): Action<undefined> =>
    prs
        .get('value')
        .chain(v => (v.get() === 1) ? next(r) : forbidden());

export const prsExists = (r: Request): Action<undefined> =>
    prs
        .exists('value')
        .chain(b => b ? next(r) : forbidden());

export const prsRemove = (_: Request): Action<undefined> =>
    prs
        .remove('value')
        .chain(() => prs.get('value'))
        .chain(m => m.isNothing() ? ok() : forbidden());

export const sessionSet = (r: Request): Action<undefined> =>
    session
        .set('value', (<Object>r.body).value)
        .chain(() => ok());

export const sessionGet = (_: Request): Action<undefined> =>
    session
        .get('value')
        .chain(v => ok({ value: v.orJust(() => undefined).get() }))

export const sessionExists = (_: Request): Action<undefined> =>
    session
        .exists('value')
        .chain(b => b ? ok({ value: b }) : notFound());

export const sessionRemove = (_: Request): Action<undefined> =>
    session
        .remove('value')
        .chain(() => ok({}));
