import { App } from '../../../lib/app';
import { ModuleConf } from '../../../lib/app/conf';
import { TEST_PORT } from './port';

export const createApp = (conf: ModuleConf) =>
    new Promise<App>((resolve, reject) => {
        let app = new App({
            ...conf,
            app: {
                ...conf.app,
                server: {
                    ...conf.app?.server,
                    http: {
                        ...conf.app?.server?.http,
                        port: TEST_PORT
                    }
                },
                vm: {
                    log: {
                        level: process.env.LOG_LEVEL || 'warn',
                        sink: console
                    }
                }
            }
        });
        let timer = setTimeout(
            () => reject(new Error('App failed to start')),
            1000
        );
        app.events.addListener('started', async () => {
            clearTimeout(timer);
            resolve(app);
        });
        app.start();
    });
