import * as http from 'http';
import * as must from 'must/register';
import * as request from 'superagent';
import * as Promise from 'bluebird';
import { toPromise } from '@quenk/noni/lib/control/monad/future';
import { noop } from '@quenk/noni/lib/data/function';
import { Server } from '../../../src/net/http/server';

const writeOk = (_: http.IncomingMessage, res: http.ServerResponse) => {

    res.write('ok');
    res.end();

};

const writeNothing = (_: http.IncomingMessage, __: http.ServerResponse) => { }

const newServer = () => new Server({ port: 8888, host: 'localhost' });

describe('server', () => {

    describe('listen', () => {

        it('must work', () => {

            let s = newServer();

            return toPromise(s.listen(writeOk))
                .then(() =>
                    request
                        .get('localhost:8888')
                        .then((r: any) => must(r.text).be('ok'))
                        .then(() => toPromise(s.stop())))


        });

        it('must queue sockets', cb => {

            let s = newServer();

            toPromise(s.listen((_: http.IncomingMessage, res: http.ServerResponse) => {

                must(s.sockets.length).be(1);
                res.end();
                cb();

            }))
                .then(() =>
                    request
                        .get('localhost:8888')
                        .then(() => toPromise(s.stop())))
                .catch(e => cb(e))
        });

    });

    describe('stop', () => {

        it('it must not wait on clients', cb => {

            let s = newServer();

            setTimeout(() => {

                must(s.sockets.length).be(4);

                s
                    .stop()
                    .chain(() => must(s.sockets.length).be(0))
                    .map(() => cb())
                    .fork(console.error, console.log);

            }, 1000);

            toPromise(s.listen(writeNothing))
                .then(() => Promise.all([
                    request.get('localhost:8888').catch(noop),
                    request.get('localhost:8888').catch(noop),
                    request.get('localhost:8888').catch(noop),
                    request.get('localhost:8888').catch(noop)
                ]))

        })

        it('should not use the same handlers after stopping', () => {

            let s = newServer();

            let state: number[] = [];

            return toPromise(s.listen((_: http.IncomingMessage, res: http.ServerResponse) => {

                state.push(1);
                res.end('ok');

            }))
                .then(() => request.get('localhost:8888'))
                .then(() => toPromise(s.stop()))
                .then(() =>
                    toPromise(s.listen((_: http.IncomingMessage, res: http.ServerResponse) => {

                        state.push(2);
                        res.end('ok');

                    })))
                .then(() => request.get('localhost:8888'))
                .then(() => must(state).eql([1, 2]))
                .then(() => toPromise(s.stop()));

        });

    });

});
