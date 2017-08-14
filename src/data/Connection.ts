import * as Bluebird from 'bluebird';

export interface Connection {

    disconnect(): Bluebird<void>
    unwrap<A>(): Bluebird<A>;

}
