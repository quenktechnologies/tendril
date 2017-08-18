import * as Bluebird from 'bluebird';

export interface Connection<A> {

    disconnect(): Bluebird<void>
    unwrap(): Bluebird<A>;

}
