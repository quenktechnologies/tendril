import * as handlers from './handlers';

import { Err } from '@quenk/noni/lib/control/error';
import { ACTION_IGNORE } from '@quenk/potoo/lib/actor/template';

import { notFound, error } from '../../../../../src/app/api/response';
import { Template } from '../../../../../src/app/module/template';
import { Module } from '../../../../../src/app/module';

export const template = (): Template => ({
    id: 'admin',

    trap: (_: Err) => ACTION_IGNORE,

    app: {
        session: {
            enable: true
        },

        routes: (_: Module) => [
            {
                method: 'delete',
                path: '/',
                filters: [handlers.disable],
                tags: {}
            },
            { method: 'post', path: '/', filters: [handlers.enable], tags: {} },
            {
                method: 'put',
                path: '/',
                filters: [handlers.redirect],
                tags: {}
            },
            {
                method: 'get',
                path: '/ping',
                filters: [handlers.ping],
                tags: {}
            },
            {
                method: 'get',
                path: '/x-headers',
                filters: [handlers.xheaders],
                tags: {}
            },
            {
                method: 'get',
                path: '/crash',
                filters: [handlers.crash],
                tags: {}
            },
            {
                method: 'get',
                path: '/num',
                filters: [handlers.getNum],
                tags: {}
            },
            {
                method: 'post',
                path: '/num',
                filters: [handlers.saveNum],
                tags: {}
            },
            {
                method: 'get',
                path: '/prs',
                filters: [
                    handlers.prsSet,
                    handlers.prsGet,
                    handlers.prsExists,
                    handlers.prsRemove
                ],
                tags: {}
            },
            {
                method: 'get',
                path: '/session',
                filters: [handlers.sessionGet],
                tags: {}
            },
            {
                method: 'post',
                path: '/session',
                filters: [handlers.sessionSet],
                tags: {}
            },
            {
                method: 'head',
                path: '/session',
                filters: [handlers.sessionExists],
                tags: {}
            },
            {
                method: 'delete',
                path: '/session',
                filters: [handlers.sessionRemove],
                tags: {}
            }
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
