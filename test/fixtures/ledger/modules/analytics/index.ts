import { Template } from '../../../../../src/app/module/template';
import { Module } from '../../../../../src/app/module';
import { show } from '../../../../../src/app/api/action/response';
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

        }]

    }

});
