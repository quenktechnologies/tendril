import * as filters from './filters';
import { Template } from '../../../../../../../src/app/module/template';
import { Module } from '../../../../../../../src/app/module';
import { App } from '../../../../../../../src/app';
import { show } from '../../../../../../../src/app/api/action/show';

export const template: Template = {

    id: 'reports',

    create: (a: App) => new Module(a),

    app: {

        routes: (m: Module) => {

            m.install('get', '/', [() => (show('reports'))]);

            m.install('get', '/custom', [
              () => { console.error('fuputa '); return show('custom', { content: 'Custom' }); }
            ]);

            m.install('get', '/:report', [
                filters.modify,
                filters.isReport,
                filters.quickShow,
                () => (show('reports'))]);

        }

    }

};
