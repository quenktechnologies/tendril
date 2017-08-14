import * as express from 'express';
import * as Bluebird from 'bluebird';
import { Renderer } from '../app/Renderer';
/**
 * Result
 */
export declare class Result {
    renderer: Renderer;
    response: express.Response;
    constructor(renderer: Renderer, response: express.Response);
    send<A>(code: number, body?: A): Result;
    status(code: number): Result;
    ok<A>(body: A): Result;
    accepted(): Result;
    noContent(): Result;
    created<A>(body: A): Result;
    badRequest<A>(body: A): Result;
    unauthorized<A>(body: A): Result;
    forbidden<A>(body: A): Result;
    notFound<A>(body: A): Result;
    conflict<A>(body: A): Result;
    error(err: Error): Result;
    redirect(url: string, code?: number): Result;
    render<A>(view: string, context?: A): Bluebird<void>;
}
