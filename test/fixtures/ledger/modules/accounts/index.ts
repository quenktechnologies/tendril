import * as handlers from './handlers';
import * as reports from './modules/reports';
import { Template } from '../../../../../src/app/module/template';
import { Module } from '../../../../../src/app/module';
import { App } from '../../../../../src/app';

export const template: Template<App> = {

    id: 'accounts',

    create: (a: App) => new Module(a),

    app: {

        routes: (m: Module) => {

            m.install('get', '/', [m.show('accounts')]);
            m.install('post', '/', [handlers.create]);
            m.install('get', '/balance', [m.show('balance')]);

        },

        modules: {

            reports: reports.template

        }

    }

};
