import { Future } from '@quenk/noni/lib/control/monad/future';

import { App } from '../../';

/**
 * State represents a single step in the boot process of an Applicaiton.
 *
 * Stages are mostly executed sequentially (though some may be done in parallel).
 * Before creating a new Stage instance, consider whether it would be better
 * included as part of another one.
 */
export interface Stage {

    /**
     * name of the Stage.
     *
     * Used for debugging.
     */
    name: string

    /**
     * execute this Stage.
     */
    execute(app: App): Future<void>

}
