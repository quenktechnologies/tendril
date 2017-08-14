/// <reference types="node" />
import * as Bluebird from 'bluebird';
import * as http from 'http';
import * as net from 'net';
/**
 * ManagedServer wraps around a Server to add additional features.
 *
 * By wrapping around the server implementation, we gain the ability
 * to shutdown and restart the server when needed. Each time
 * the server is stopped, we destroy all existing socket sockets
 * so node does not wait on them to end before calling the close() callback.
 */
export declare class ManagedServer {
    port: number;
    host: string;
    server: http.Server;
    sockets: net.Socket[];
    constructor(port: number, host: string, server: http.Server);
    store(socket: net.Socket): void;
    flush(): void;
    start(): Bluebird<ManagedServer>;
    shutdown(): Bluebird<void>;
    restart(): Bluebird<ManagedServer>;
}
