import * as express from 'express';
import * as Status from './Status';
import * as Headers from './Headers';

export { Status };
export { Headers };

export interface Request extends express.Request {

    [key: string]: any;

}

export interface Response extends express.Response { 

  [key:string]: any;

}
