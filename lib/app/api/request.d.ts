import * as express from 'express';
/**
 * Method
 */
export declare type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';
/**
 * Request represents a client request.
 */
export interface Request extends express.Request {
}
