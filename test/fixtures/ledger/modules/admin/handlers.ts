import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { Disable, Enable, Redirect } from '../../../../../src/app/module';
import { ActionM } from '../../../../../src/app/api/action';
import {  Request  } from '../../../../../src/app/api/request';
import {   tell } from '../../../../../src/app/api/action/tell';
import { ok } from '../../../../../src/app/api/action/response/ok';
import { Response,  ask } from '../../../../../src/app/api/action/ask';

export const disable = (_: Request): Future<ActionM<undefined>> =>
    pure(tell('/accounts', new Disable())
        .chain(() => ok()));

export const enable = (_: Request): Future<ActionM<undefined>> =>
    pure(tell('/accounts', new Enable())
        .chain(() => ok()));

export const redirect = (_: Request): Future<ActionM<undefined>> =>
    pure(tell('/accounts', new Redirect(301, 'localhost:8888'))
        .chain(() => ok()));

export const ping = (_: Request): Future<ActionM<undefined>> =>
  pure(ask<Response<string>>('/pong', 'ping').chain(r => ok(r)));
