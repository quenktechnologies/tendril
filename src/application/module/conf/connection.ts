import * as connection from '../../connection';

import { Type } from '@quenk/noni/lib/data/type';

/**
 * Connector used to create a system managed connection.
 */
export type Connector = (...options: Type[]) => connection.Connection;

/**
 * ConnectionConfs declares a map of Connections to establish.
 */
export interface ConnectionConfs {

    [key: string]: ConnectionConf

}

/**
 * ConnectionConf declares the configuration for a remote service connections.
 */
export interface ConnectionConf {

    /**
     * connector used.
     */
    connector: Connector,

    /**
     * options (if any).
     */
    options?: Type[]

}
