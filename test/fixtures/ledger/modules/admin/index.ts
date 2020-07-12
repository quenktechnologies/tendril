import * as handlers from './handlers';
import { Err } from '@quenk/noni/lib/control/error';
import { ACTION_IGNORE } from '@quenk/potoo/lib/actor/template';
import { Template } from '../../../../../src/app/module/template';
import { Module } from '../../../../../src/app/module';
import { App } from '../../../../../src/app';
import { notFound, error } from '../../../../../src/app/api/action/response';

export const template = (): Template<App> => ({

    id: 'admin',

    create: (a: App) => new Module(a),

    trap: (_: Err) => ACTION_IGNORE,

    app: {

        session: {

            enabled: true

        },

        routes: (_: Module) => [

            { method: 'delete', path: '/', filters: [handlers.disable] },
            { method: 'post', path: '/', filters: [handlers.enable] },
            { method: 'put', path: '/', filters: [handlers.redirect] },
            { method: 'get', path: '/ping', filters: [handlers.ping] },
            { method: 'get', path: '/x-headers', filters: [handlers.xheaders] },
            { method: 'get', path: '/crash', filters: [handlers.crash] },
            { method: 'get', path: '/num', filters: [handlers.getNum] },
            { method: 'post', path: '/num', filters: [handlers.saveNum] }

        ],

        notFoundHandler: () => {

            process.env.NOT_FOUND_APPLIED = 'yes';

            return notFound();

        },

        errorHandler: () => {

            process.env.ERROR_HANDLER_APPLIED = 'yes';

            return error();

        }

    }
});
