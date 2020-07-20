import { Future } from '@quenk/noni/lib/control/monad/future';
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
    name: string;
    /**
     * execute this Stage.
     */
    execute(): Future<void>;
}
/**
 * StageBundle combines various Stages into a single sequential Stage
 * implementation.
 *
 * The execute() method executes each member of the bundle one at a time,
 * updating the name property each time one completes.
 */
export declare class StageBundle implements Stage {
    stages: Stage[];
    name: string;
    constructor(stages: Stage[]);
    execute(): Future<void>;
}
