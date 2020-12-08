import * as handlers from './handlers';

import { Err } from '@quenk/noni/lib/control/error';
import { ACTION_IGNORE } from '@quenk/potoo/lib/actor/template';

import { notFound, error } from '../../../../../src/app/api/response';
import { Template } from '../../../../../src/app/module/template';
import { Module } from '../../../../../src/app/module';
import { App } from '../../../../../src/app';

export const template = (): Template => ({

    id: 'admin',

    create: s => new Module(<App>s),

    trap: (_: Err) => ACTION_IGNORE,

    app: {

        session: {

            enable: true

        },

        routes: (_: Module) => [

            { method: 'delete', path: '/', filters: [handlers.disable] },
            { method: 'post', path: '/', filters: [handlers.enable] },
            { method: 'put', path: '/', filters: [handlers.redirect] },
            { method: 'get', path: '/ping', filters: [handlers.ping] },
            { method: 'get', path: '/x-headers', filters: [handlers.xheaders] },
            { method: 'get', path: '/crash', filters: [handlers.crash] },
            { method: 'get', path: '/num', filters: [handlers.getNum] },
            { method: 'post', path: '/num', filters: [handlers.saveNum] },
            {
                method: 'get', path: '/prs', filters: [
                    handlers.prsSet,
                    handlers.prsGet,
                    handlers.prsExists,
                    handlers.prsRemove
                ]
            },
            { method: 'get', path: '/session', filters: [handlers.sessionGet] },
            { method: 'post', path: '/session', filters: [handlers.sessionSet] },
            { method: 'head', path: '/session', filters: [handlers.sessionExists] },
            { method: 'delete', path: '/session', filters: [handlers.sessionRemove] }

        ],

        on: {

            notFound: () => {

                process.env.NOT_FOUND_APPLIED = 'yes';

                return notFound();

            },

            internalError: () => {

                process.env.ERROR_HANDLER_APPLIED = 'yes';

                return error();

            }

        }

        }
    });
