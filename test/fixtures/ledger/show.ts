import { Future, pure } from '@quenk/noni/lib/control/monad/future';
import { Content } from '../../../src/app/show';

export interface Context { [key: string]: string }

const views: { [key: string]: (o: any) => string } = {

    index: () => '<b>Index</b>',

    accounts: () => 'Chart of Accounts',

    balance: () => '$0.00',

    reports: () => 'A list of reports',

  custom: (o: any) => `${o.content}`,

    income: () => 'Income Report'

}

export const show = (view: string, ctx: Context = {}): Future<Content> =>
    pure(<Content>{ type: 'text/plain', content: views[view](ctx) })
