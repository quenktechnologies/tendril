import * as express from 'express';

/**
 * Middleware provides handlers used by the express framework pre-routing.
 */
export type Middleware = express.RequestHandler;

/**
 * Middlewares map.
 */
export interface Middlewares {

    [key: string]: Middleware

}
