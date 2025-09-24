import { Lazy, evaluate } from '@quenk/noni/lib/data/lazy';
import * as http from 'node:http';
import * as https from 'node:https';
import * as net from 'node:net';

export const PROTOCOL_HTTP = 'http';
export const PROTOCOL_HTTPS = 'https';

export const DEFAULT_HOST = '0.0.0.0';
export const DEFAULT_PORT = 2407;

/**
 * Handler function type that is called with the incomming client request.
 */
export type Handler = <
    I extends http.IncomingMessage,
    R extends http.ServerResponse
>(
    req: I,
    res: R
) => void;

export interface ServerOptions {
    /**
     * host address to bind to.
     */
    host?: string;

    /**
     * port number to bind to.
     */
    port?: number;
}

export interface HTTPConfiguration extends ServerOptions, http.ServerOptions {}

/**
 * HTTPSConfiguration for secure http servers.
 */
export interface HTTPSConfiguration
    extends ServerOptions,
        https.ServerOptions {}

/**
 * ServerProtocol indicates which protocol the server should use.
 */
export type ServerProtocol = 'http' | 'https';

/**
 * ServerConfiguration
 */
export interface ServerConfiguration {
    /**
     * protocol to use.
     */
    protocol?: ServerProtocol;

    /**
     * http configuration to use when HTTP.
     */
    http?: HTTPConfiguration;

    /**
     * https configuration to use when HTTPS.
     */
    https?: HTTPSConfiguration;
}

/**
 * TendrilServer wraps around an http server to provide stop and restart
 * facilities.
 *
 * This is necessary as node currently provides no way to stop a server
 * without waiting on clients.
 */
export class TendrilServer {
    constructor(
        public server: net.Server,
        public conf: ServerOptions = {},
        public sockets: Map<net.Socket, net.Socket> = new Map()
    ) {}

    static createInstance(conf: ServerConfiguration, handler: Lazy<Handler>) {
        let config = conf.protocol === PROTOCOL_HTTPS ? conf.https : conf.http;
        let actualHandler = evaluate(handler);
        return new TendrilServer(
            conf.protocol === PROTOCOL_HTTPS
                ? https.createServer(config ?? {}, actualHandler)
                : http.createServer(config ?? {}, actualHandler),
            config
        );
    }

    /**
     * start the TendrilServer.
     *
     * This will commence listening for connections blocking until the server
     * has been closed or an error encountered.
     */
    async start(): Promise<void> {
        return new Promise(resolve => {
            this.server.on('connection', s => {
                this.sockets.set(s, s);
                s.on('close', () => this.sockets.delete(s));
            });

            this.server.on('listening', resolve);

            let { host = DEFAULT_HOST, port = DEFAULT_PORT } = this.conf;
            this.server.listen({ host, port });
        });
    }

    /**
     * flush closes all open client connections.
     *
     * The server itself is not closed and remains open for new connections.
     */
    flush(): void {
        this.sockets.forEach(s => s.destroy());
        this.sockets = new Map();
    }

    /**
     * stop the TendrilServer.
     *
     * Open connections will be forced closed so that the server can exit.
     */
    async stop(): Promise<void> {
        this.flush();
        await new Promise(resolve => this.server.close(resolve));
    }
}
