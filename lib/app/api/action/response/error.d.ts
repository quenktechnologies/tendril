import { Future } from '@quenk/noni/lib/control/monad/future';
import { Maybe } from '@quenk/noni/lib/data/maybe';
import { Err } from '@quenk/noni/lib/control/error';
import { Context } from '../../context';
import { Response } from './';
/**
 * InternalServerError response.
 */
export declare class InternalServerError<A> extends Response<Err, A> {
    body: Maybe<Err>;
    next: A;
    constructor(body: Maybe<Err>, next: A);
    status: number;
    map<B>(f: (a: A) => B): InternalServerError<B>;
    exec({ response }: Context<A>): Future<A>;
}
/**
 * error sends the "INTERNAL SERVER ERROR" status and can optionally log
 * the error to console.
 */
export declare const error: (err?: Err | undefined) => import("@quenk/noni/lib/control/monad/free").Free<import("..").Action<any>, undefined>;
