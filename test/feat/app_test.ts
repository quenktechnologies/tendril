import * as request from 'superagent';

import { assert } from '@quenk/test/lib/assert';
import { toPromise } from '@quenk/noni/lib/control/monad/future';

import { template } from '../fixtures/ledger';
import { App } from '../../src/app';

const URL = 'localhost:8888';
const FILE_STYLE_CSS = `${URL}/style.css`;
const ROUTE_ACCOUNTS = `${URL}/accounts`;
const ROUTE_ACCOUNTS_BALANCE = `${ROUTE_ACCOUNTS}/balance`;
const ROUTE_REPORTS = `${ROUTE_ACCOUNTS}/reports`;
const ROUTE_REPORTS_CUSTOM = `${ROUTE_REPORTS}/custom`;
const ROUTE_ADMIN = `${URL}/admin`;
const ROUTE_ADMIN_PING = `${ROUTE_ADMIN}/ping`;
const ROUTE_ADMIN_CRASH = `${ROUTE_ADMIN}/crash`;
const ROUTE_ADMIN_XHEADERS = `${ROUTE_ADMIN}/x-headers`;
const ROUTE_ADMIN_NUM = `${ROUTE_ADMIN}/num`;
const ROUTE_ADMIN_PRS = `${ROUTE_ADMIN}/prs`;
const ROUTE_ANALYTICS = `${URL}/analytics`;

const agent = request.agent();

describe('tendril', () => {

    describe('ledger', () => {

        let app: App = new App(template);

        beforeEach(() => process.env.APP_INIT = '');

        beforeEach(() => process.env.APP_CONNECTED = '');

        beforeEach(() => process.env.APP_START = '');

        beforeEach(() => toPromise(app.start()));

        afterEach(() => toPromise(app.stop()));

        xit('should invoke init hook',
            () => assert(process.env.APP_INIT).equal('true'));

        xit('should invoke connected hook',
            () => assert(process.env.APP_CONNECTED).equal('true'));

        xit('should invoke connected hook',
            () => assert(process.env.APP_START).equal('true'));

        xit('should have connections',
            () => assert(app.pool.store['main']).not.be.undefined());

        xit('should show views', () =>
            agent
                .get(URL)
                .then((r: any) =>
                    assert(r.text).equal('<b>Index</b>')));

        xit('should show parent views if none configured for child', () =>
            agent
                .get(ROUTE_ACCOUNTS_BALANCE)
                .then((r: any) =>
                    assert(r.text).equal('$0.00')));

        xit('should bubble views up', () =>
            agent
                .get(ROUTE_REPORTS)
                .then((r: any) =>
                    assert(r.text).equal('A list of reports')));

        xit('should apply middleware', () =>
            agent
                .get(FILE_STYLE_CSS)
                .then((r: any) =>
                    assert(r.text).equal('body{background:black;color:white;}\n')));

        xit('should configure post routes', () =>
            agent
                .post(ROUTE_ACCOUNTS)
                .send({ name: 'sundry', class: 'expense' })
                .then((r: any) =>
                    assert(r.body.id).not.equal(undefined)));

        xit('should run filters', () => {

            let fourohfoured = false;

            return agent
                .get(`${ROUTE_REPORTS}/xincome`)
                .then((r: any) => assert(r.text).equal('Income Report'))
                .then(() => agent.get(`${ROUTE_REPORTS}/xexpense`))
                .then((r: any) => assert(r.text).equal('A list of reports'))
                .then(() => agent.get(`${ROUTE_REPORTS}/liabilities`))
                .catch((e: Error) => {
                    console.error(e);
                    if (e.message !== 'Forbidden') throw e;

                    fourohfoured = true;
                    return fourohfoured;

                })

        });

        xit('should allow modules to be recursively disabled', () =>
            agent
                .get(ROUTE_ACCOUNTS)
                .then((r: any) => assert(r.text).equal('Chart of Accounts'))
                .then(() => agent.get(ROUTE_ACCOUNTS_BALANCE))
                .then((r: any) => assert(r.text).equal('$0.00'))
                .then(() => agent.delete(ROUTE_ADMIN))
                .then(() => agent.get(ROUTE_ACCOUNTS)
                    .catch((e: Error) => assert(e.message).equal('Not Found')))
                .then(() => agent.get(ROUTE_ACCOUNTS_BALANCE)
                    .catch((e: Error) => assert(e.message).equal('Not Found'))));

        xit('should allow modules to enable each other recursively', () =>
            agent
                .get(ROUTE_ACCOUNTS)
                .then((r: any) => assert(r.text).equal('Chart of Accounts'))
                .then(() => agent.get(ROUTE_ACCOUNTS_BALANCE))
                .then((r: any) => assert(r.text).equal('$0.00'))
                .then(() => agent.delete(ROUTE_ADMIN))
                .then(() => agent.get(ROUTE_ACCOUNTS)
                    .catch((e: Error) => assert(e.message).equal('Not Found')))
                .then(() => agent.get(ROUTE_ACCOUNTS_BALANCE)
                    .catch((e: Error) => assert(e.message).equal('Not Found')))
                .then(() => agent.post(ROUTE_ADMIN))
                .then(() => agent.get(ROUTE_ACCOUNTS))
                .then((r: any) => assert(r.text).equal('Chart of Accounts'))
                .then(() => agent.get(ROUTE_ACCOUNTS_BALANCE))
                .then((r: any) => assert(r.text).equal('$0.00')));

        xit('should allow modules to redirect each other recursively', () =>
            agent
                .get(ROUTE_ACCOUNTS)
                .then((r: any) => assert(r.text).equal('Chart of Accounts'))
                .then(() => agent.put(ROUTE_ADMIN))
                .then(() => agent.get(ROUTE_ACCOUNTS))
                .then((r: any) => assert(r.text).equal('<b>Index</b>'))
                .then(() => agent.get(ROUTE_ACCOUNTS_BALANCE))
                .then((r: any) => assert(r.text).equal('<b>Index</b>')));

        xit('should stop redirecting enabled modules', () =>
            agent
                .get(ROUTE_ACCOUNTS)
                .then((r: any) => assert(r.text).equal('Chart of Accounts'))
                .then(() => agent.get(ROUTE_ACCOUNTS_BALANCE))
                .then((r: any) => assert(r.text).equal('$0.00'))
                .then(() => agent.put(ROUTE_ADMIN))
                .then(() => agent.get(ROUTE_ACCOUNTS))
                .then((r: any) => assert(r.text).equal('<b>Index</b>'))
                .then(() => agent.get(ROUTE_ACCOUNTS_BALANCE))
                .then((r: any) => assert(r.text).equal('<b>Index</b>'))
                .then(() => agent.post(ROUTE_ADMIN))
                .then(() => agent.get(ROUTE_ACCOUNTS))
                .then((r: any) => assert(r.text).equal('Chart of Accounts'))
                .then(() => agent.get(ROUTE_ACCOUNTS_BALANCE))
                .then((r: any) => assert(r.text).equal('$0.00')))

        xit('should acknowledge some modules start disabled', () =>
            agent
                .get(ROUTE_ANALYTICS)
                .catch((e: Error) => assert(e.message).equal('Not Found')));

        xit('should spawn child actors', () => {

            assert(process.env.CHILD_RUNNING).equal('yes');

        });

        xit('should stop child actors', () =>
            toPromise(app.stop())
                .then(() => assert(process.env.CHILD_RUNNING).equal('no')));

        xit('should allow asking of actors', () =>
            agent
                .get(ROUTE_ADMIN_PING)
                .then((r: any) => assert(r.text).equal('pong')));

        xit('should send custom headers', () =>
            agent
                .get(ROUTE_ADMIN_XHEADERS)
                .then((r: any) => {

                    assert(r.headers['x-powered-by']).equal('Thanos');
                    assert(r.headers['x-men']).equal('wolverine;storm;roll');
                    assert(r.headers['x-mega']).equal('zero');

                }))

        xit('should provide context to views', () =>
            agent
                .get(ROUTE_REPORTS_CUSTOM)
                .then((r: any) => assert(r.text).equal('Custom')));

        xit('should execute module filters', () => {

            process.env.MODULE_FILTERS_WORK = '';

            return agent
                .get(ROUTE_ADMIN_PING)
                .then(() => assert(process.env.MODULE_FILTERS_WORK).not.equal('yes'))
                .then(() => agent.get(ROUTE_ACCOUNTS_BALANCE))
                .then(() => {

                    assert(process.env.MODULE_FILTERS_WORK).equal('yes');

                })

        });

        xit('should invoke not found hooks', () =>
            agent
                .get(`${ROUTE_ADMIN}/foobar`)
                .catch((e) => {

                    assert(process.env.NOT_FOUND_APPLIED).equal('yes');
                    assert(e.response.status).equal(404);

                }));

        xit('should enable sessions when configured', () =>
            agent
                .get(ROUTE_ADMIN_NUM)
                .then((r: any) => {

                    assert(r.body.num).equal(0);

                })
                .then(() =>
                    agent
                        .post(ROUTE_ADMIN_NUM)
                        .send({ num: 9 }))
                .then(() =>
                    agent
                        .get(ROUTE_ADMIN_NUM)
                        .then((r: any) => {

                            assert(r.body.num).equal(9);

                        })))

        it('should allow the prs api', () =>
            agent
                .get(ROUTE_ADMIN_PRS)
                .then(r => assert(r.status).equal(200)));

    });

    describe('error escalation', () => {

        let app: App = new App(template);

        beforeEach(() => toPromise(app.start()));

        afterEach(() => toPromise(app.stop()));

        xit('should respond with 500', () =>
            agent
                .get(ROUTE_ADMIN_CRASH)
                .then(() => assert(false).true())
                .catch((e) => {

                    assert(process.env.ERROR_HANDLER_APPLIED).equal('yes');
                    assert(e.response.status).equal(500);

                }));

    });

});
