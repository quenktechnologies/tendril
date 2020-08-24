import { Future } from '@quenk/noni/lib/control/monad/future';
import { Type } from '@quenk/noni/lib/data/type';
import { Action, Api, Context } from './';
/**
 * GetToken
 * @private
 */
export declare class GetToken<A> extends Api<A> {
    next: (a: Type) => A;
    constructor(next: (a: Type) => A);
    map<B>(f: (a: A) => B): GetToken<B>;
    exec({ request }: Context<A>): Future<A>;
}
/**
 * getToken provides the current CSRF token.
 */
export declare const getToken: () => Action<string>;
