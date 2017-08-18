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
export class ManagedServer {

    sockets: net.Socket[] = [];

    constructor(public port: number, public host: string, public server: http.Server) { }

    store(socket: net.Socket) {

        this.sockets.push(socket);
        socket.on('close', () => this.sockets.filter(s => !(s === socket)));

    }

    flush(): void {

        this.sockets.forEach(s => s.destroy());

    }

    start(): Bluebird<ManagedServer> {

        return Bluebird.fromCallback(cb => {
            this.server.on('connection', socket => this.store(socket));
            this.server.on('listening', () => cb(null, this));
            this.server.listen(this.port, this.host);
        });

    }

    shutdown(): Bluebird<void> {

        return Bluebird.fromCallback(cb => {
            this.server.close(() => cb(null, this));
        }).
            then(() => this.flush());

    }

    restart(): Bluebird<ManagedServer> {

        return this.shutdown().then(() => this.start());

    }

}

