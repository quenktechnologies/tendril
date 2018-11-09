import * as accounts from './modules/accounts';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import { Application } from 'express';
import { static as statc } from 'express';
import { pure } from '@quenk/noni/lib/control/monad/future';
import { App } from '../../../src/app';
import { Module } from '../../../src/app/module';
import { Template } from '../../../src/app/module/template';
import { memdb } from '../memgodb';
import { show } from './show';
import { Context, show as view } from '../../../src/app/api';

export const template: Template = {

    id: '/',

    create: (a: App) => new Module(a),

    server: {

        host: 'localhost',

        port: 8888

    },

    connections: {

        main: {

            connector: memdb,

            options: [{}]

        }

    },

    app: {

        on: {

            init: () => pure(void (process.env.APP_INIT = 'true')),

            connected: () => pure(void (process.env.APP_CONNECTED = 'true'))

        },

        middleware: {

            available: {

                log: {

                    provider: morgan,

                    options: [process.env.HTTP_LOG_FORMAT]

                },

                static: {

                    provider: statc,

                    options: [`${__dirname}/static`, { maxAge: 0 }]

                },


                json: {

                    provider: bodyParser.json

                },

                urlencoded: {

                    provider: bodyParser.urlencoded

                }

            },

            enabled: ['log', 'static', 'json', 'urlencoded']

        },

        routes: (m: Module, app: Application) => {

            app.get('/', (req, res) => new Context(m, req, res, [], () =>
                pure(view('index'))).run())

        },

        views: {

            provider: () => show

        },

        modules: {

            accounts: accounts.template

        }

    }

}
