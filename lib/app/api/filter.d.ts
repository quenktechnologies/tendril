import { ActionM } from './action';
import { Request } from './request';
/**
 * Filter functions are applied to the request.
 *
 * These can either transform the request or terminate.
 */
export declare type Filter<A> = (r: Request) => ActionM<A>;
