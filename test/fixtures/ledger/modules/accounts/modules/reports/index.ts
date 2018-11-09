import * as express from 'express';
import * as filters from './filters';
import { pure } from '@quenk/noni/lib/control/monad/future';
import { Template } from '../../../../../../../src/app/module/template';
import { Module } from '../../../../../../../src/app/module';
import { App } from '../../../../../../../src/app';
import { Context, show } from '../../../../../../../src/app/api';

export const template: Template = {

    id: 'reports',

    create: (a: App) => new Module(a),

    app: {

        routes: (m: Module, app: express.Application) => {

            app.get('/', (req, res) =>
                new Context(m, req, res, [], () => pure(show('reports'))).run())

            app.get('/:report', (req, res) =>
                new Context(m, req, res, [
                    filters.modify,
                    filters.isReport,
                    filters.quickShow
                ], () => pure(show('reports'))).run())

        }

    }

};
