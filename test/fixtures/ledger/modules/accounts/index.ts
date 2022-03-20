import * as handlers from './handlers';
import * as reports from './modules/reports';

import { Template } from '../../../../../src/app/module/template';
import { Module } from '../../../../../src/app/module';
import { App } from '../../../../../src/app';

export const template = (): Template => ({

    id: 'accounts',

    create: s=> new Module(<App>s),

    app: {

        filters: [handlers.setModuleFiltersWorks],

        routes: (m: Module) => [

            { method: 'get', path: '/', filters: [m.show('accounts')],tags:{} },
            { method: 'post', path: '/', filters: [handlers.create],tags:{} },
            { method: 'get', path: '/balance', filters: [m.show('balance')],tags:{} }

        ],

        dirs: {

          self: __dirname,

          public: {

            files: {

              dir: 'public4'

            }

          }

        },

        modules: {

            reports: reports.template

        }

    }

});
