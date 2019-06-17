import * as handlers from './handlers';
import * as reports from './modules/reports';
import { Template } from '../../../../../src/app/module/template';
import { Module } from '../../../../../src/app/module';
import { App } from '../../../../../src/app';

export const template = (): Template<App> => ({

    id: 'accounts',

    create: (a: App) => new Module(a),

    app: {

        filters: [handlers.setModuleFiltersWorks],

        routes: (m: Module) => [

            { method: 'get', path: '/', filters: [m.show('accounts')] },
            { method: 'post', path: '/', filters: [handlers.create] },
            { method: 'get', path: '/balance', filters: [m.show('balance')] }

        ],

        modules: {

            reports: reports.template

        }

    }

});
