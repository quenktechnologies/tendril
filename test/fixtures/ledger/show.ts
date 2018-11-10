import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { Content } from '../../../src/app/show';

const views: { [key: string]: string } = {

    index: '<b>Index</b>',

    accounts: 'Chart of Accounts',

    balance: '$0.00',

    reports: 'A list of reports',

    income: 'Income Report'

}

export const show = (view: string): Future<Content> =>
    pure(<Content>{ type: 'text/plain', content: views[view] })
