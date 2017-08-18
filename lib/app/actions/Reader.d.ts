import { Context } from './Context';
export declare class Reader<C> {
    f: (e: Context<C>) => void;
    constructor(f: (e: Context<C>) => void);
    chain(f: (_: void) => Reader<C>): Reader<C>;
    run(c: Context<C>): void;
}
