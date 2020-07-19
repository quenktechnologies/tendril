import * as express from 'express';

import { Action } from './';

/**
 * Method
 */
export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * Request represents a client request.
 */
export interface Request extends express.Request { }

/**
 * Filter functions are applied to the request.
 * 
 * These can either transform the request or terminate.
 */
export type Filter<A> = (r: Request) => Action<A>;

/**
 * ErrorFilter functions are applied to a request when it triggers an error.
 */
export type ErrorFilter = (e: Error, r: Request) => Action<void>;
