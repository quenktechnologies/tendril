import * as http from 'http';
import * as net from 'net';
import { Maybe, Nothing, just, nothing } from '@quenk/noni/lib/data/maybe';
import {
    Future,
    fromCallback,
    pure,
    raise
} from '@quenk/noni/lib/control/monad/future';

/**
 * Handler function type that is called with the incomming client request.
 */
export type Handler =
    <I extends http.IncomingMessage,
        R extends http.ServerResponse> (req: I, res: R) => void;

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

        if (this.handle instanceof Nothing) {

            this.handler = handler;
            this.handle = just(http.createServer(handler));

            return this
                .handle
                .map(h => <Future<Server>>fromCallback<Server>(cb => {

                    h
                        .on('connection', s => {

                            this.sockets.push(s);

                            s.on('close', () => this.sockets =
                                this.sockets.filter(sck => (s !== sck)));

                        })
                        .on('listening', () => cb(undefined, this))
                        .listen(this.configuration);

                }))
                .get();

        } else {

            return raise(new Error('listen: Server is already listening'));

        }

    }

    /**
     * restart the Server.
     */
    restart(): Future<Server> {

        return this
            .stop()
            .chain(() => this.listen(this.handler));

    }

    /**
     * stop the Server
     */
    stop(): Future<void> {

        return this
            .flush()
            .chain(s =>
                s
                    .handle
                    .map(close(s))
                    .orJust(() => pure(s))
                    .get())
            .map(() => { this.handle = nothing() })

    }

    /**
     * flush all currently connected clients to the server.
     */
    flush(): Future<Server> {

        this.sockets.forEach(s => s.destroy());
        this.sockets = [];
        return pure(<Server>this);

    }

}

const close = (s: Server) => (h: http.Server): Future<Server> =>
    fromCallback<Server>(cb => h.close(() => cb(undefined, s)));
