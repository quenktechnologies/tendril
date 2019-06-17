import * as handlers from './handlers';
import { Err } from '@quenk/noni/lib/control/error';
import { ACTION_IGNORE } from '@quenk/potoo/lib/actor/template';
import { Template } from '../../../../../src/app/module/template';
import { Module } from '../../../../../src/app/module';
import { App } from '../../../../../src/app';

export const template = (): Template<App> => ({

    id: 'admin',

    create: (a: App) => new Module(a),

    trap: (_: Err) => ACTION_IGNORE,

    app: {

        routes: (_: Module) => [

            { method: 'delete', path: '/', filters: [handlers.disable] },
            { method: 'post', path: '/', filters: [handlers.enable] },
            { method: 'put', path: '/', filters: [handlers.redirect] },
            { method: 'get', path: '/ping', filters: [handlers.ping] },
            { method: 'get', path: '/x-headers', filters: [handlers.xheaders] },
            { method: 'get', path: '/crash', filters: [handlers.crash] }

        ]

    }

});
