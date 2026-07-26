import { Future } from '@quenk/noni/lib/control/monad/future';

/**
 * Show is a function the application can use to produce
 * content for a client.
 */
export type Show = (view: string, context?: object) => Future<Content>;

/**
 * Content to send to the client.
 */
export interface Content {
    /**
     * type is the mime type used when sending the content.
     */
    type: string;

    /**
     * content sent to the client.
     *
     * Either a string or a binary buffer.
     */
    content: string | Buffer;
}
