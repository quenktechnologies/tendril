import * as http from 'http';
import * as net from 'net';
import { Maybe, nothing } from '@quenk/noni/lib/data/maybe';
import {
    Future,
    fromCallback,
    pure
} from '@quenk/noni/lib/control/monad/future';

/**
 * Handler function type that is called with the incomming client request.
 */
export type Handler = (req: http.IncomingMessage, res: http.ServerResponse) => void;

/**
 * Configuration for a server.
 *
 * Matches the options argument of http.Server#listen
 */
export interface Configuration {

    /**
     * port to bind to.
     */
    port: number,

    /**
     * host to bind to.
     */
    host: string,

}

/**
 * Server wraps around an http server to provide stop and restart
 * facilities.
 *
 * This is necessary as node currently provides no way to stop a server
 * without waiting on clients.
 */
export class Server {

    constructor(public configuration: Configuration) { }

    sockets: net.Socket[] = [];

    handle: Maybe<http.Server> = nothing();

    handler: Handler = (_: http.IncomingMessage, __: http.ServerResponse) => { };

    /**
     * listen for connections passing them to the provided handler.
     */
    listen(handler: Handler): Future<Server> {

        this.handler = handler;

        this.handle = this
            .handle
            .orJust(() => http.createServer(handler));

        return this
            .handle
            .map(h => <Future<Server>>fromCallback<Server>(cb => {

                h
                    .on('connection', s => {

                        this.sockets.push(s);

                        s.on('close', () =>
                            this.sockets = this.sockets.filter(sck => !(s === sck)));

                    })
                    .on('listening', () => cb(undefined, this))
                    .listen(this.configuration);

            }))
            .get();

    }

    /**
     * restart the Server.
     */
    restart(): Future<Server> {

        return this.stop().chain(() => this.listen(this.handler));

    }

    /**
     * stop the Server
     */
    stop(): Future<Server> {

        return this
            .handle
            .map(h => fromCallback(cb => h.close(() => cb(undefined, this)))
                .chain(() => this.flush()))
            .get();

    }

    /**
     * flush all currently connected clients to the server.
     */
    flush(): Future<Server> {

        this.sockets.forEach(s => s.destroy());
        return pure(<Server>this);

    }

}
