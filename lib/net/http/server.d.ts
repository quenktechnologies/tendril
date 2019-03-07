import * as http from 'http';
import * as net from 'net';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Future } from '@quenk/noni/lib/control/monad/future';
/**
 * Handler function type that is called with the incomming client request.
 */
export declare type Handler = <I extends http.IncomingMessage, R extends http.ServerResponse>(req: I, res: R) => void;
/**
 * Configuration for a server.
 *
 * Matches the options argument of http.Server#listen
 */
export interface Configuration {
    /**
     * port to bind to.
     */
    port: number | string;
    /**
     * host to bind to.
     */
    host: string;
}
/**
 * Server wraps around an http server to provide stop and restart
 * facilities.
 *
 * This is necessary as node currently provides no way to stop a server
 * without waiting on clients.
 */
export declare class Server {
    configuration: Configuration;
    constructor(configuration: Configuration);
    sockets: net.Socket[];
    handle: Maybe<http.Server>;
    handler: Handler;
    /**
     * listen for connections passing them to the provided handler.
     */
    listen(handler: Handler): Future<Server>;
    /**
     * restart the Server.
     */
    restart(): Future<Server>;
    /**
     * stop the Server
     */
    stop(): Future<void>;
    /**
     * flush all currently connected clients to the server.
     */
    flush(): Future<Server>;
}
