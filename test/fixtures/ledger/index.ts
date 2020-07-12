import * as accounts from './modules/accounts';
import * as admin from './modules/admin';
import * as analytics from './modules/analytics';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import { static as statc } from 'express';
import { pure } from '@quenk/noni/lib/control/monad/future';
import { App } from '../../../src/app';
import { Module } from '../../../src/app/module';
import { Template } from '../../../src/app/module/template';
import { memdb } from '../memgodb';
import { show } from './show';
import { Child } from '../child';
import { Pong } from '../pong';
import { Spawnable } from '../spawnable';

export const template = (): Template<App> => ({

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

            connected: () => pure(void (process.env.APP_CONNECTED = 'true')),

            started: () => pure(void (process.env.APP_START = 'true'))

        },

        log: {

          enabled: true

        },

        middleware: {

            available: {

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

            enabled: ['static', 'json', 'urlencoded']

        },

        routes: (m: Module) => [

            { method: 'get', path: '/', filters: [m.show('index')] }

        ],

        views: {

            provider: () => show

        },

        modules: {

            accounts: accounts.template,

            admin: admin.template,

            analytics: analytics.template

        }

    },

    children: [

        { id: 'child', create: (app: App) => new Child(app) },

        { id: 'pong', create: (app: App) => new Pong(app) }

    ]

})
