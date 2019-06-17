import { Type } from '@quenk/noni/lib/data/type';
import { Context } from '@quenk/potoo/lib/actor/context';
import { Actor } from '@quenk/potoo/lib/actor';

/**
 * Constructor of a new actor instance.
 */
export interface Constructor {

    new(...args: Type[]): Actor<Context>

}

/**
 * SpawnConfs declares a map of SpawnConf templates.
 */
export interface SpawnConfs {

    [key: string]: SpawnConf

}

/**
 * SpawnConf is a declartive alternative for specifying child actors.
 *
 * This method of specifying child actors is unsafe and care must be taken
 * to ensure the "args" property matches the arguments the constructor for
 * the actor accepts.
 */
export interface SpawnConf {

    /**
     * constructor is used to instantiate an instance of the actor.
     */
    constructor: Constructor,

    /**
     * arguments passed to the constructor.
     *
     * Note that the first parameter must be the system instance.
     */
    arguments: Type[]

}
