import * as session from 'express-session';
import * as express from 'express';

import { Record, merge, map } from '@quenk/noni/lib/data/record';
import { isObject, isNumber } from '@quenk/noni/lib/data/type';
import { Object } from '@quenk/noni/lib/data/jsonx';

import { MemoryConnection } from '../middleware/session/store/connection/memory';
import {
    Descriptor,
    SESSION_DESCRIPTORS,
    SESSION_DATA,
    deleteSessionKey
} from '../api/storage/session';
import { ModuleInfo } from '../module';
import { BaseStartupTask } from './';
import { randomSecret } from './cookie';

export const SESSION_COOKIE_NAME = 'tendril.session.id';
export const POOL_KEY_SESSION = '$tendril-session-store-connection';

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
        provider: () => new MemoryConnection(),

        options: {}
    }
};

/**
 * SessionSupport enables http session middleware for modules that declare it.
 *
 * Enabling session support on a parent module will make it available for
 * all the children module as well so no need to repeat.
 *
 * This will configure session support for EACH module that declares
 * "app.session.enable = true". A app.session.options.secret SHOULD be provided
 * for signing cookies (to detect tampering). If it is not supplied the
 * following takes place:
 *
 * 1. The value is read from process.env.SESSION_SECRET or
 * 2. the value is read from process.env.COOKIE_SECRET or
 * 3. the value is read from process.env.SECRET otherwise
 * 4. a random string is generated (sessions will not survive app restarts).
 *
 * Note: If a session store is specified, this task will attempt to open its
 * connection and add it to the global pool.
 */
export class SessionSupport extends BaseStartupTask {
    name = 'session-support';

    async execute(mod: ModuleInfo) {
        let { pool } = this.app;

        if (
            mod.conf &&
            mod.conf.app &&
            mod.conf.app.session &&
            mod.conf.app.session.enable
        ) {
            let conf = merge(defaultOptions, mod.conf.app.session);

            if (!conf.options.secret) {
                if (process.env.SESSION_SECRET) {
                    conf.options.secret = process.env.SESSION_SECRET;
                } else if (process.env.COOKIE_SECRET) {
                    conf.options.secret = process.env.COOKIE_SECRET;
                } else if (process.env.SECRET) {
                    conf.options.secret = process.env.SECRET;
                } else {
                    console.warn(WARN_NO_SECRET);
                    conf.options.secret = randomSecret;
                }
            }

            let conn = conf.store.provider(session, conf.store.options);
            await conn.open();

            let store = await conn.checkout();
            pool.add(POOL_KEY_SESSION, conn);

            mod.express.use(session(merge(conf.options, { store })));
            mod.express.use(handleSessionTTL);
        }
    }
}

/**
 * handleSessionTTL is responsible for:
 * 1. Removing session values that have reached TTL 0.
 * 2. Decrementing session values that have their TTL set.
 * @private
 */
export const handleSessionTTL = (
    req: express.Request,
    _: express.Response,
    next: express.NextFunction
) => {
    if (
        req.session &&
        isObject((<Object>(<object>req.session))[SESSION_DATA]) &&
        isObject((<Object>(<object>req.session))[SESSION_DESCRIPTORS])
    ) {
        let session = <Object>(<object>req.session);
        let descs = <Record<Descriptor>>session[SESSION_DESCRIPTORS];

        descs = map(descs, (d: Descriptor, k: string) => {
            if (d.ttl != null && isNumber(d.ttl)) {
                if (d.ttl === 0) {
                    deleteSessionKey(session, k);
                } else {
                    d.ttl = d.ttl - 1;
                }
            }

            return d;
        });

        (<Record<Descriptor>>session[SESSION_DESCRIPTORS]) = descs;
    }

    next();
};
