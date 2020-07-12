import { Future } from '@quenk/noni/lib/control/monad/future';
import { ModuleDatas } from '../../module/data';
import { Stage } from './';
/**
 * SessionStage configures session middleware automtically if enabled.
 *
 * This will configure session support for EACH module that declares
 * "app.session.enabled = true". A app.session.options.secret SHOULD be provided
 * for sigining cookies (to detect tampering). If it is not supplied the
 * following takes place:
 *
 * 1. The value is read from process.env.SESSION_SECRET or
 * 2. the value is read from process.env.COOKIE_SECRET or
 * 3. the value is read from process.env.SECRET otherwise
 * 4. a random string is generated (sessions will not survive app restarts).
 */
export declare class SessionStage implements Stage {
    modules: ModuleDatas;
    constructor(modules: ModuleDatas);
    name: string;
    execute(): Future<void>;
}
