import * as Promise from 'bluebird';
import * as http from '../../http';
import { Context } from './Context';
import { Result } from './';

/**
 * Response terminates the http request with an actual HTTP response.
 */
export class Response<C> {

    public status = http.Status.OK;

    constructor(public body?: any) { }

    apply({ response }: Context<C>): void {

        response.status(this.status);

        if (this.body)
            response.send(this.body);
        else
            response.end();

    }

}

export class Ok<C> extends Response<C> { }

export class Accepted<C> extends Response<C> { status = http.Status.ACCEPTED; }

export class NoContent<C> extends Response<C> { status = http.Status.NO_CONTENT; }

export class Created<C> extends Response<C> { status = http.Status.CREATED; }

export class BadRequest<C> extends Response<C> { status = http.Status.BAD_REQUEST; }

export class Unauthorized<C> extends Response<C> { status = http.Status.UNAUTHORIZED; }

export class Forbidden<C> extends Response<C> { status = http.Status.FORBIDDEN; }

export class NotFound<C> extends Response<C> { status = http.Status.NOT_FOUND; }

export class Conflict<C> extends Response<C> { status = http.Status.CONFLICT; }

export class InternalServerError<C> extends Response<C> {

    status = http.Status.INTERNAL_SERVER_ERROR;

    constructor(public body: Error) {

        super(body);

    }

    apply(c: Context<C>): void {

      //Log internal errors to console
      //TODO: once we have actor support this will be sent
      //to an actor address.
      console.error(c);

      return super.apply(c);

    }

}

export class Status<C>{

    constructor(public code: number) { }

    apply({ response }: Context<C>) {

        response.status(this.code);

    }

}

export class Redirect<C>{

    constructor(public url: string, public code: number) { }

    apply({ response }: Context<C>): void {

        response.redirect(this.url, this.code);

    }

}

export class Render<A, C> {

    constructor(public view: string, public context: A) { }

    apply({ module, response }: Context<C>): void {

        module
            .render(this.view, this.context)
            .then(view => {

                response.set(http.Headers.CONTENT_TYPE, view.contentType);
                response.write(view.content);
                response.end();

            });

    }

}

export class Async<C> {

    constructor(public f: () => Promise<Result<C>>) { }

    apply(ctx: Context<C>): void {

        this.f().then(r => r.run(ctx)).catch(e => ctx.module.onError(e));

    }

}

export class Next<C> {

  constructor(public r?: http.Request) {}

  apply(ctx:Context<C>):void {

    ctx.next();

  }

}
