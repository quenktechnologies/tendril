import * as request from 'superagent';
import { must } from '@quenk/must';
import { toPromise } from '@quenk/noni/lib/control/monad/future';
import { App } from '../../src/app';
import { template } from '../fixtures/ledger';

const URL = 'localhost:8888';
const FILE_STYLE_CSS = `${URL}/style.css`;
const ROUTE_ACCOUNTS = `${URL}/accounts`;
const ROUTE_ACCOUNTS_BALANCE = `${ROUTE_ACCOUNTS}/balance`;
const ROUTE_REPORTS = `${ROUTE_ACCOUNTS}/reports`;
const ROUTE_ADMIN = `${URL}/admin`;
const ROUTE_ADMIN_PING = `${ROUTE_ADMIN}/ping`;
const ROUTE_ANALYTICS = `${URL}/analytics`;

describe('ledger', () => {

    let app: App = new App(template, {});

    beforeEach(() => process.env.APP_INIT = '');

    beforeEach(() => process.env.APP_CONNECTED = '');

    beforeEach(() => process.env.APP_START = '');

    beforeEach(() => toPromise(app.start()));

    afterEach(() => toPromise(app.stop()));

    it('should invoke init hook',
        () => must(process.env.APP_INIT).equal('true'));

    it('should invoke connected hook',
        () => must(process.env.APP_CONNECTED).equal('true'));

    it('should invoke connected hook',
        () => must(process.env.APP_START).equal('true'));

    it('should have connections',
        () => must(app.pool.store['main']).not.be.undefined());

    it('should show views', () =>
        request
            .get(URL)
            .then((r: any) =>
                must(r.text).equal('<b>Index</b>')));

    it('should show parent views if none configured for child', () =>
        request
            .get(ROUTE_ACCOUNTS_BALANCE)
            .then((r: any) =>
                must(r.text).equal('$0.00')));

    it('should bubble views up', () =>
        request
            .get(ROUTE_REPORTS)
            .then((r: any) =>
                must(r.text).equal('A list of reports')));

    it('should apply middleware', () =>
        request
            .get(FILE_STYLE_CSS)
            .then((r: any) =>
                must(r.text).equal('body{background:black;color:white;}\n')));

    it('should configure post routes', () =>
        request
            .post(ROUTE_ACCOUNTS)
            .send({ name: 'sundry', class: 'expense' })
            .then((r: any) =>
                must(r.body.id).not.equal(undefined)));

    it('should run filters', () => {

        let fourohfoured = false;

        return request
            .get(`${ROUTE_REPORTS}/xincome`)
            .then((r: any) => must(r.text).equal('Income Report'))
            .then(() => request.get(`${ROUTE_REPORTS}/xexpense`))
            .then((r: any) => must(r.text).equal('A list of reports'))
            .then(() => request.get(`${ROUTE_REPORTS}/liabilities`))
            .catch((e: Error) => {

                if (e.message !== 'Forbidden') throw e;

                fourohfoured = true;
                return fourohfoured;

            })

    });

    it('should allow modules to be recursively disabled', () =>
        request
            .get(ROUTE_ACCOUNTS)
            .then((r: any) => must(r.text).equal('Chart of Accounts'))
            .then(() => request.get(ROUTE_ACCOUNTS_BALANCE))
            .then((r: any) => must(r.text).equal('$0.00'))
            .then(() => request.delete(ROUTE_ADMIN))
            .then(() => request.get(ROUTE_ACCOUNTS)
                .catch((e: Error) => must(e.message).equal('Not Found')))
            .then(() => request.get(ROUTE_ACCOUNTS_BALANCE)
                .catch((e: Error) => must(e.message).equal('Not Found'))));

    it('should allow modules to enable each other recursively', () =>
        request
            .get(ROUTE_ACCOUNTS)
            .then((r: any) => must(r.text).equal('Chart of Accounts'))
            .then(() => request.get(ROUTE_ACCOUNTS_BALANCE))
            .then((r: any) => must(r.text).equal('$0.00'))
            .then(() => request.delete(ROUTE_ADMIN))
            .then(() => request.get(ROUTE_ACCOUNTS)
                .catch((e: Error) => must(e.message).equal('Not Found')))
            .then(() => request.get(ROUTE_ACCOUNTS_BALANCE)
                .catch((e: Error) => must(e.message).equal('Not Found')))
            .then(() => request.post(ROUTE_ADMIN))
            .then(() => request.get(ROUTE_ACCOUNTS))
            .then((r: any) => must(r.text).equal('Chart of Accounts'))
            .then(() => request.get(ROUTE_ACCOUNTS_BALANCE))
            .then((r: any) => must(r.text).equal('$0.00')));

    it('should allow modules to redirect each other recursively', () =>
        request
            .get(ROUTE_ACCOUNTS)
            .then((r: any) => must(r.text).equal('Chart of Accounts'))
            .then(() => request.put(ROUTE_ADMIN))
            .then(() => request.get(ROUTE_ACCOUNTS))
            .then((r: any) => must(r.text).equal('<b>Index</b>'))
            .then(() => request.get(ROUTE_ACCOUNTS_BALANCE))
            .then((r: any) => must(r.text).equal('<b>Index</b>')));

    it('should stop redirecting enabled modules', () =>
        request
            .get(ROUTE_ACCOUNTS)
            .then((r: any) => must(r.text).equal('Chart of Accounts'))
            .then(() => request.get(ROUTE_ACCOUNTS_BALANCE))
            .then((r: any) => must(r.text).equal('$0.00'))
            .then(() => request.put(ROUTE_ADMIN))
            .then(() => request.get(ROUTE_ACCOUNTS))
            .then((r: any) => must(r.text).equal('<b>Index</b>'))
            .then(() => request.get(ROUTE_ACCOUNTS_BALANCE))
            .then((r: any) => must(r.text).equal('<b>Index</b>'))
            .then(() => request.post(ROUTE_ADMIN))
            .then(() => request.get(ROUTE_ACCOUNTS))
            .then((r: any) => must(r.text).equal('Chart of Accounts'))
            .then(() => request.get(ROUTE_ACCOUNTS_BALANCE))
            .then((r: any) => must(r.text).equal('$0.00')))

    it('should acknowledge some modules start disabled', () =>
        request
            .get(ROUTE_ANALYTICS)
            .catch((e: Error) => must(e.message).equal('Not Found')));

    it('should spawn child actors', () => {

        must(process.env.CHILD_RUNNING).equal('yes');

    });

    it('should stop child actors', () =>
        toPromise(app.stop())
            .then(() => must(process.env.CHILD_RUNNING).equal('no')));

  it('should allow asking of actors', ()=>
    request
    .get(ROUTE_ADMIN_PING)
    .then((r:any)=> must(r.text).equal('pong')));

});