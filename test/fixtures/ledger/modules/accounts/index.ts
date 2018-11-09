import * as handlers from './handlers';
import * as express from 'express';
import * as reports from './modules/reports';
import { pure } from '@quenk/noni/lib/control/monad/future';
import { Template } from '../../../../../src/app/module/template';
import { Module } from '../../../../../src/app/module';
import { App } from '../../../../../src/app';
import { Context, show } from '../../../../../src/app/api';

export const template: Template = {

    id: 'accounts',

    create: (a: App) => new Module(a),

    app: {

        routes: (m: Module, app: express.Application) => {

            app.post('/', (req, res) =>
                new Context(m, req, res, [], handlers.create).run())

            app.get('/balance', (req, res) =>
                new Context(m, req, res, [], () => pure(show('balance'))).run())

        },

        modules: {

            reports: reports.template

        }

    }

};
