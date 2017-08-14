import * as express from 'express';
import * as Bluebird from 'bluebird';
import { Renderer } from '../app/Renderer';

/**
 * Result
 */
export class Result {

    constructor(public renderer: Renderer, public response: express.Response) { }

    send<A>(code: number, body?: A): Result {

        this.response.status(code);

        if (body)
            this.response.send(body);

        return this;

    }

    status(code: number): Result {

        this.response.status(code);
        return this;

    }

    ok<A>(body: A): Result {

        return this.send(200, body);

    }

    accepted(): Result {

        return this.send(202);

    }

    noContent(): Result {

        return this.send(204);

    }

    created<A>(body: A): Result {

        return this.send(201, body);

    }

    badRequest<A>(body: A): Result {

        return this.send(400, body);

    }

    unauthorized<A>(body: A): Result {

        return this.send(401, body);

    }

    forbidden<A>(body: A): Result {

        return this.send(403, body);

    }

    notFound<A>(body: A): Result {

        return this.send(404, body);

    }

    conflict<A>(body: A): Result {

        return this.send(409, body);

    }

    error(err: Error): Result {

        console.error(err.stack ? err.stack : err);
        return this.send(500);

    }

    redirect(url: string, code: number = 302): Result {

        this.response.redirect(url, code);
        return this;

    }

    render<A>(view: string, context?: A): Bluebird<void> {

        return this.renderer.render(view, context || {})
            .then(v => {

                this.response.set('Content-Type', v.contentType || 'text/html');
                this.ok(v.content);

            })

    }

}
