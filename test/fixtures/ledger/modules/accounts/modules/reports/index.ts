import * as filters from './filters';
import { pure } from '@quenk/noni/lib/control/monad/future';
import { Template } from '../../../../../../../src/app/module/template';
import { Module } from '../../../../../../../src/app/module';
import { App } from '../../../../../../../src/app';
import { show } from '../../../../../../../src/app/api';

export const template: Template = {

    id: 'reports',

    create: (a: App) => new Module(a),

    app: {

        routes: (m: Module) => {

            m.install('get', '/', [() => pure(show('reports'))]);

            m.install('get', '/:report', [
                filters.modify,
                filters.isReport,
                filters.quickShow,
                () => pure(show('reports'))]);

        }

    }

};
