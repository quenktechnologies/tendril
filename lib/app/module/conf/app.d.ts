import * as conf from '@quenk/potoo/lib/actor/system/vm/conf';
import * as filters from '../../api/filter';
import * as hooks from './hooks';
import * as show from './show';
import * as mid from './middleware';
import * as mod from './modules';
import * as routes from './routes';
import * as session from './session';
import * as log from '../../boot/stage/log';
import { App } from '../../';
/**
 * AppConf is the type of the configuration object for tendril apps and modules.
 *
 * It is based on the Potoo template with additional optional sections
 * for configuring tendril modules.
 */
export interface AppConf<S extends App> {
    system?: conf.Conf;
    on?: hooks.HookConf<S>;
    log?: log.LogConf;
    session?: session.SessionConf;
    middleware?: {
        available?: mid.AvailableMiddleware;
        enabled?: string[];
    };
    routes?: routes.Routes;
    notFoundHandler?: filters.Filter<void>;
    errorHandler?: filters.ErrorFilter;
    views?: show.ShowConf;
    modules?: mod.ModulesConf<S>;
    filters?: filters.Filter<void>[];
}
