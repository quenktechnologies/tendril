import { Template } from '../../../../../src/app/module/template';
import { Module } from '../../../../../src/app/module';
import { show } from '../../../../../src/app/api/response';
import { App } from '../../../../../src/app';

export const template = (): Template<App> => ({

    id: 'analytics',

    disabled: true,

    create: (a: App) => new Module(a),

    app: {

        routes: (_: Module) => [{

            method: 'get',

            path: '/',

            filters: [() => (show('analytics'))]

        }],

        dirs: {

            self: __dirname,

            public: ['../../public2', { dir: '../../public3' }]

        }

    }

});
