import { Context } from './Context';

export class Reader<C>{

    constructor(public f: (e: Context<C>) => void) { }

    chain(f: (_: void) => Reader<C>): Reader<C> {

        return new Reader(c => f(this.run(c)).run(c));

    }

    run(c: Context<C>): void {

        return this.f(c);

    }

}
