import * as session from 'express-session';
import * as express from 'express';

import { Future, pure, sequential } from '@quenk/noni/lib/control/monad/future';
import { doN, DoFn } from '@quenk/noni/lib/control/monad';
import { merge, map, mapTo } from '@quenk/noni/lib/data/record';
import { noop } from '@quenk/noni/lib/data/function';
import { isObject, isNumber } from '@quenk/noni/lib/data/type';
import { Object } from '@quenk/noni/lib/data/jsonx';

import { SessionStoreProvider } from '../../middleware/session/store/provider';
import {
    MemoryStoreProvider
} from '../../middleware/session/store/provider/memory';
import {
    Descriptor,
    SESSION_DESCRIPTORS,
    SESSION_DATA,
    deleteSessionKey
} from '../../api/storage/session';
import { ModuleDatas } from '../../module/data';
import { randomSecret } from './cookie-parser';
import { Stage } from './';

type Work = DoFn<void, Future<void>>;

export const SESSION_COOKIE_NAME = 'tendril.session.id';

export const WARN_NO_SECRET =
    '[SessionStage]: Warning! No app.session.options.secret configured! \
A random string will be generated and used however this means user sessions\
will not be valid if the application restarts!';

const defaultOptions = {

    enable: false,

    options: {

        name: SESSION_COOKIE_NAME,

        saveUnitialized: false,

        resave: false

    },

    store: {

        provider: new MemoryStoreProvider,

        options: {}

    }

}

/**
 * SessionConf contains settings for configuring session usage.
 */
export interface SessionConf {

    /**
     * enable if true, will turn on session support.
     *
     * Defaults to true.
     */
    enable?: boolean,

    /**
     * options configurable for the session module.
     */
    options?: session.SessionOptions,

    /**
     * store configuration for the session.
     */
    store?: {

        /**
         * provider used to create the underlying Store object.
         *
         * If unspecified, the inefficient memory store will be used.
         */
        provider?: SessionStoreProvider,

        /**
         * options passed to the SessionStoreProvider
         */
        options?: object

    }

}

/**
 * SessionStage configures session middleware automtically if enabled.
 *
 * This will configure session support for EACH module that declares 
 * "app.session.enable = true". A app.session.options.secret SHOULD be provided 
 * for sigining cookies (to detect tampering). If it is not supplied the 
 * following takes place:
 *
 * 1. The value is read from process.env.SESSION_SECRET or
 * 2. the value is read from process.env.COOKIE_SECRET or
 * 3. the value is read from process.env.SECRET otherwise
 * 4. a random string is generated (sessions will not survive app restarts).
 */
export class SessionStage implements Stage {

    constructor(public modules: ModuleDatas) { }

    name = 'session';

    execute(): Future<void> {

        let { modules } = this;

        return sequential(mapTo(modules, m => doN(<Work>function*() {

            if (m.template &&
                m.template.app &&
                m.template.app.session &&
                m.template.app.session.enable) {

                let conf = merge(defaultOptions, m.template.app.session);

                if (!conf.options.secret) {

                    if (process.env.SESSION_SECRET) {
                        conf.options.secret = process.env.SESSION_SECRET;
                    } else if (process.env.COOKIE_SECRET) {
                        conf.options.secret = process.env.COOKIE_SECRET
                    } else if (process.env.SECRET) {
                        conf.options.secret = process.env.SECRET;
                    } else {
                        console.warn(WARN_NO_SECRET);
                        conf.options.secret = randomSecret;
                    }

                }

                let store =
                    yield conf.store.provider.create(session,
                        conf.store.options);

                m.app.use(session(merge(conf.options, { store })));
                m.app.use(handleSessionTTL);

            }

            return pure(<void>undefined);

        }))).map(noop);
    }
}

/**
 * handleSessionTTL is responsible for:
 * 1. Removing session values that have reached TTL 0.
 * 2. Decrementing session values that have their TTL set.
 * @private
 */
export const handleSessionTTL =
    (req: express.Request, _: express.Response, next: express.NextFunction) => {
        if (req.session &&
            isObject(req.session[SESSION_DATA]) &&
            isObject(req.session[SESSION_DESCRIPTORS])) {

            let session = <Object>req.session;
            let descs = req.session[SESSION_DESCRIPTORS];

            descs = map(descs, (d: Descriptor, k: string) => {

                if ((d.ttl != null) && isNumber(d.ttl)) {

                    if (d.ttl === 0) {

                        deleteSessionKey(session, k);

                    } else {

                        d.ttl = d.ttl - 1;

                    }

                }

                return d;

            });

            session[SESSION_DESCRIPTORS] = descs;

        }

        next();

    }
