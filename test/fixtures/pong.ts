import { Case } from '@quenk/potoo/lib/actor/resident/case';
import { Immutable } from '@quenk/potoo/lib/actor/resident';
import { Context } from '../../src/app/state/context';
import { Request, Response } from '../../src/app/api/action/control/actor';
import { App } from '../../src/app';

export class Pong extends Immutable<Request<string>, Context, App> {

    receive = [

        new Case(Request, (r: Request<string>) => 
            this.tell(r.from, new Response('pong'))        )

    ];

    run() { }

}
