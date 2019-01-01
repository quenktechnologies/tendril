import * as status from '../status';
import { liftF } from '@quenk/noni/lib/control/monad/free';
import {   nothing } from '@quenk/noni/lib/data/maybe';
import {ActionM} from '../../';
import {Response} from './';

/**
 * NoContent response.
 */
export class NoContent<A> extends Response<void, A> {

    constructor(public next: A) { super(nothing(), next); }

    status = status.NO_CONTENT;

    map<B>(f: (a: A) => B): NoContent<B> {

        return new NoContent(f(this.next));

    }

}

/**
 * noContent sends the "NO CONTENT" status to the client.
 */
export const noContent = (): ActionM<undefined> => 
  liftF(new NoContent(undefined));
