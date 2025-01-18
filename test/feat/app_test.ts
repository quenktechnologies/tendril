import axios from 'axios';

import { expect } from '@jest/globals';

import { makeDir, removeDir, writeTextFile } from '@quenk/noni/lib/io/file';

import { App } from '../../lib/app';
import { ModuleConf } from '../../lib/app/module/conf';
import { dirname } from 'path/win32';

const TEST_DIR = `${process.cwd()}/test/feat`;
const FIXTURES_DIR = `${TEST_DIR}/fixtures`;
const STATIC_DIR = `${FIXTURES_DIR}/static`;

const agent = axios.create({
    baseURL: 'http://localhost:2407',
    validateStatus: () => true
});

let app: App | undefined;

const createApp = (conf: ModuleConf) =>
    new Promise<void>((resolve, reject) => {
        app = new App(conf);
        let timer = setTimeout(
            () => reject(new Error('App failed to start')),
            1000
        );
        app.events.addListener('started', async () => {
            clearTimeout(timer);
            resolve();
        });
        app.start();
    });

describe('tendril', () => {
    afterEach(async () => {
        if (app) await app.stop();
        app = undefined;
    });

    describe('static dir support', () => {
        beforeEach(async () => {
            await makeDir(STATIC_DIR);
        });

        beforeEach(async () => {
            await removeDir(STATIC_DIR);
        });

        const staticDirSupportTests = {
            'should serve string configs': {
                dirs: `${STATIC_DIR}/public`,
                make: ['public/test.txt'],
                tests: ['test.txt']
            },
            'should serve array configs': {
                dirs: [`${STATIC_DIR}/public`],
                make: ['public/test.txt'],
                tests: ['test.txt']
            },
            'should serve mapped configs': {
                dirs: {
                    'path/to/public0': `${STATIC_DIR}/public0`,
                    public1: { path: `${STATIC_DIR}/public1` }
                },
                make: ['public0/test0.txt', 'public1/test1.txt'],
                tests: ['test0.txt', 'test1.txt']
            }
        };

        for (let [key, conf] of Object.entries(staticDirSupportTests)) {
            it(key, async () => {
                let { dirs, make, tests } = conf;
                for (let target of make) {
                    await makeDir(dirname(`${STATIC_DIR}/${target}`));
                    await writeTextFile(`${STATIC_DIR}/${target}`, key);
                }

                await createApp({ app: { routing: { dirs } } });

                for (let test of tests) {
                    let res = await agent.get(test);
                    expect(res.status).toBe(200);
                    expect(res.data).toBe(key);
                }
            });
        }
    });
});
