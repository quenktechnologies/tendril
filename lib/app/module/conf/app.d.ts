import * as system from '@quenk/potoo/lib/actor/system/configuration';
import * as filters from '../../api/filter';
import * as hooks from './hooks';
import * as show from './show';
import * as mid from './middleware';
import * as mod from './modules';
import * as routes from './routes';
import { App } from '../../';
/**
 * AppConf for the application.
 */
export interface AppConf<S extends App> {
    system?: system.Configuration;
    on?: hooks.HookConf<S>;
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
