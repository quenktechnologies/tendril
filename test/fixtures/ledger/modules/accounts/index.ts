import * as handlers from './handlers';
import * as reports from './modules/reports';
import { pure } from '@quenk/noni/lib/control/monad/future';
import { Template } from '../../../../../src/app/module/template';
import { Module } from '../../../../../src/app/module';
import { App } from '../../../../../src/app';
import { show } from '../../../../../src/app/api';

export const template: Template = {

    id: 'accounts',

    create: (a: App) => new Module(a),

    app: {

        routes: (m: Module) => {

            m.install('get', '/', [], ()=> pure(show('accounts')));
            m.install('post', '/', [], handlers.create);
            m.install('get', '/balance', [], () => pure(show('balance')));

        },

        modules: {

            reports: reports.template

        }

    }

};
