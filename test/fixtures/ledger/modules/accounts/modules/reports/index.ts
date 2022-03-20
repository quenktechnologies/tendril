import * as filters from './filters';
import { Template } from '../../../../../../../src/app/module/template';
import { Module } from '../../../../../../../src/app/module';
import { App } from '../../../../../../../src/app';
import { show } from '../../../../../../../src/app/api/response';

export const template = (): Template => ({

    id: 'reports',

    create: s => new Module(<App>s),

    app: {

        routes: (_: Module) => [

            { method: 'get', path: '/', filters: [() => (show('reports'))],tags:{} },

            {
                method: 'get',
                path: '/custom',
                filters: [
                    () => show('custom', { content: 'Custom' })

                ],
              tags:{}
            },
            {
                method: 'get', path: '/:report', filters: [
                    filters.modify,
                    filters.isReport,
                    filters.quickShow,
                    () => (show('reports'))

                ],
              tags:{}
            }]

    }

});
