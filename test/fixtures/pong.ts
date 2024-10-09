import { TypeCase } from '@quenk/potoo/lib/actor/framework';
import { Immutable } from '@quenk/potoo/lib/actor/framework/resident';

import { Request, Response } from '../../src/app/api/control/actor';

export class Pong extends Immutable<Request<string>> {
    selectors() {
        return [
            new TypeCase(Request, async r => {
                await this.tell(r.from, new Response('pong'));
            })
        ];
    }
}
