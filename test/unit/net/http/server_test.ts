import * as http from 'http';
import * as request from 'superagent';
import * as Promise from 'bluebird';

import { assert } from '@quenk/test/lib/assert';
import { toPromise } from '@quenk/noni/lib/control/monad/future';
import { noop } from '@quenk/noni/lib/data/function';

import { Server } from '../../../../src/net/http/server';

const writeOk = (_: http.IncomingMessage, res: http.ServerResponse) => {

    res.write('ok');
    res.end();

};

const writeNothing = (_: http.IncomingMessage, __: http.ServerResponse) => { }

const newServer = () => new Server({ port: 8888, host: 'localhost' });

let server: Server;

describe('server', () => {

    beforeEach(() => {

        server = newServer();

    });

    afterEach(() => {

        if (server != null)
            return toPromise(server.stop());

    });

    describe('listen', () => {

        it('should work', () => {

            return toPromise(server.listen(writeOk))
                .then(() =>
                    request
                        .get('localhost:8888')
                        .then((r: any) => assert(r.text).equal('ok'))
                        .then(() => toPromise(server.stop())))


        });

        it('must queue sockets', cb => {

            toPromise(
                server.listen(
                    (_: http.IncomingMessage, res: http.ServerResponse) => {

                        assert(server.sockets.length).equal(1);
                        res.end();
                        cb();

                    }))
                .then(() =>
                    request
                        .get('localhost:8888'))
                .catch(e => cb(e))
        });

    });

    describe('stop', () => {

        it('it must not wait on clients', cb => {

            setTimeout(() => {

                assert(server.sockets.length).equal(4);

                server
                    .stop()
                    .map(() => assert(server.sockets.length).equal(0))
                    .map(() => cb())
                    .fork(console.error, console.log);

            }, 1000);

            toPromise(server.listen(writeNothing))
                .then(() => Promise.all([
                    request.get('localhost:8888').catch(noop),
                    request.get('localhost:8888').catch(noop),
                    request.get('localhost:8888').catch(noop),
                    request.get('localhost:8888').catch(noop)
                ]))

        })

        it('should not use the same handlers after stopping', () => {

            let state: number[] = [];

            return toPromise(server.listen(
                (_: http.IncomingMessage, res: http.ServerResponse) => {

                    state.push(1);
                    res.end('ok');

                }))
                .then(() => request.get('localhost:8888'))
                .then(() => toPromise(server.stop()))
                .then(() =>
                    toPromise(server.listen(
                        (_: http.IncomingMessage, res: http.ServerResponse) => {

                            state.push(2);
                            res.end('ok');

                        })))
                .then(() => request.get('localhost:8888'))
                .then(() => assert(state).equate([1, 2]))
                .then(() => toPromise(server.stop()));

        });

    });

});
