import * as filters from './filters';
import { Template } from '../../../../../../../src/app/module/template';
import { Module } from '../../../../../../../src/app/module';
import { App } from '../../../../../../../src/app';
import { show } from '../../../../../../../src/app/api/response';

export const template = (): Template<App> => ({

    id: 'reports',

    create: (a: App) => new Module(a),

    app: {

        routes: (_: Module) => [

            { method: 'get', path: '/', filters: [() => (show('reports'))] },

            {
                method: 'get',
                path: '/custom',
                filters: [
                    () => show('custom', { content: 'Custom' })

                ]
            },
            {
                method: 'get', path: '/:report', filters: [
                    filters.modify,
                    filters.isReport,
                    filters.quickShow,
                    () => (show('reports'))

                ]
            }]

    }

});
