import { Future } from '@quenk/noni/lib/control/monad/future';
import {ActionM} from './action';
import {Request} from './request';

/**
 * Filter functions are applied to the request.
 * 
 * These can either transform the request or terminate.
 */
export type Filter<A> = (r: Request) => Future<ActionM<A>>;
