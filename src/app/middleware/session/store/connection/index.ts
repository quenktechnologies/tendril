import * as express from 'express';
import * as session from 'express-session';

import { Future } from '@quenk/noni/lib/control/monad/future';

import { Connection } from '../../../../connection';

/**
 * Provider for SessionStoreConnections.
 */
export type Provider
   = (exFunc: SessionFunc, options?: object) => SessionStoreConnection
  ;

/**
 * SessionFunc is the default function exported by express-session.
 */
export type SessionFunc
    = (options?: session.SessionOptions) => express.RequestHandler
    ;

/**
 * SessionStoreConnection is a wrapper around an express-session#Store instance
 * that allows tendril interoperability.
 */
export interface SessionStoreConnection extends Connection {

    /**
     * checkout the underlying Store.
     *
     * This method is called after the Connection is open and the session
     * middleware is ready to be configured.
     */
    checkout(): Future<session.Store>

}
