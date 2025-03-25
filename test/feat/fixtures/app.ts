import { App } from '../../../lib/app';
import { ModuleConf } from '../../../lib/app/module/conf';

export const createApp = (conf: ModuleConf) =>
    new Promise<App>((resolve, reject) => {
        let app = new App({
            app: {
                ...conf.app,
                vm: {
                    log: { level: 'debug', sink: console }
                }
            },
            ...conf
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
