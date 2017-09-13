import * as http from 'http';
import * as Bluebird from 'bluebird';
import * as express from 'express';
import { ManagedServer } from '../server';
import { Module } from './Module';

const defaults = {
    port: 2407,
    host: '0.0.0.0'
};

/**
 * Application is the main class of the framework.
 */
export class Application<C> {

    public express: express.Application = express();
    public server: ManagedServer;

    constructor(public main: Module<C>) {

        process.on('unhandledRejection', (e: Error) => main.onError(e))
        process.on('uncaughtException', (e: Error) => main.onError(e));

    }

    start(): Bluebird<Application<C>> {

        return this.main.init(this)
            .then(() => {

                let opts = (<any>Object).assign({}, defaults, this.main.getConf().tendril.server);

                this.server = new ManagedServer(
                    opts.port,
                    opts.host,
                    http.createServer(this.main.getExpressApp()));

                return this.server.start();

            })
            .then(() => this);

    }

    stop() {

        return this.server.shutdown().then(() => this);

    }

}

