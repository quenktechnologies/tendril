import * as show from '../../show';
import { Type } from '@quenk/noni/lib/data/type';

/**
 * ShowProvider is a function that will provide a Show.
 */
export type ShowProvider = (...options: Type[]) => show.Show;

/**
 * ShowConf allows the show function for a module to be configured.
 */
export interface ShowConf {
    /**
     * provider for the Show.
     */
    provider: ShowProvider;

    /**
     * options passed to the provider (optionally).
     */
    options?: Type[];
}
