import * as handlers from './handlers';
import { Template } from '../../../../../src/app/module/template';
import { Module } from '../../../../../src/app/module';
import { App } from '../../../../../src/app';

export const template: Template = {

    id: 'admin',

    create: (a: App) => new Module(a),

    app: {

        routes: (m: Module) => {

            m.install('delete', '/', [], handlers.disable);
            m.install('post', '/', [], handlers.enable);
            m.install('put', '/', [], handlers.redirect);

        }

    }

};
