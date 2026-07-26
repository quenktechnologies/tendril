import * as express from 'express';

/**
 * Middleware for the express framework.
 *
 * These are installed per module prior to the configured routing.
 */
export type Middleware = express.RequestHandler;

/**
 * Middlewares map.
 */
export interface Middlewares {
    [key: string]: Middleware;
}
