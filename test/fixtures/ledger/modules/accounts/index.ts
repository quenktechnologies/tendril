import * as handlers from './handlers';
import * as reports from './modules/reports';

import { Template } from '../../../../../src/app/module/template';
import { Module } from '../../../../../src/app/module';

export const template = (): Template => ({
    id: 'accounts',

    app: {
        filters: [handlers.setModuleFiltersWorks],

        routes: (m: Module) => [
            {
                method: 'get',
                path: '/',
                filters: [m.show('accounts')],
                tags: {}
            },
            { method: 'post', path: '/', filters: [handlers.create], tags: {} },
            {
                method: 'get',
                path: '/balance',
                filters: [m.show('balance')],
                tags: {}
            }
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
