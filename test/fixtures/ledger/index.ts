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
import { show as view } from '../../../src/app/api';
import {Child} from '../child';

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

    routes: (m: Module) => {

      m.install('get', '/', [() => pure(view('index'))]);

    },

    views: {

      provider: () => show

    },

    modules: {

      accounts: accounts.template,

      admin: admin.template,

      analytics: analytics.template

    }

  },

  children: [{id: 'child', create: (app:App) => new Child(app)}]

}
