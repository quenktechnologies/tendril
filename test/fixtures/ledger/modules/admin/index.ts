import * as handlers from './handlers';
import { Err } from '@quenk/noni/lib/control/error';
import { ACTION_IGNORE } from '@quenk/potoo/lib/actor/template';
import { Template } from '../../../../../src/app/module/template';
import { Module } from '../../../../../src/app/module';
import { App } from '../../../../../src/app';

export const template: Template = {

    id: 'admin',

    create: (a: App) => new Module(a),

    trap: (_: Err) => ACTION_IGNORE,

    app: {

        routes: (m: Module) => {

            m.install('delete', '/', [handlers.disable]);
            m.install('post', '/', [handlers.enable]);
            m.install('put', '/', [handlers.redirect]);
            m.install('get', '/ping', [handlers.ping]);
            m.install('get', '/x-headers', [handlers.xheaders]);
            m.install('get', '/crash', [handlers.crash]);

        }

    }

};
