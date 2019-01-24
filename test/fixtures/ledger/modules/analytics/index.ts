import { Template } from '../../../../../src/app/module/template';
import { Module } from '../../../../../src/app/module';
import { show } from '../../../../../src/app/api/action/show';
import { App } from '../../../../../src/app';

export const template: Template = {

    id: 'analytics',

    disabled: true,

    create: (a: App) => new Module(a),

    app: {

        routes: (m: Module) => {

            m.install('get', '/', [ () => (show('analytics'))]);

        }

    }

};
