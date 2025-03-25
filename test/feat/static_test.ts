import axios from 'axios';

import { expect } from '@jest/globals';

import { makeDir, removeDir, writeTextFile } from '@quenk/noni/lib/io/file';

import { App } from '../../lib/app';
import { dirname } from 'path/win32';
import { createApp } from './fixtures/app';

const TEST_DIR = `${process.cwd()}/test/feat`;
const FIXTURES_DIR = `${TEST_DIR}/fixtures`;
const STATIC_DIR = `${FIXTURES_DIR}/static`;

const agent = axios.create({
    baseURL: 'http://localhost:2407',
    validateStatus: () => true
});

let app: App | undefined;

describe('tendril', () => {
    afterEach(async () => {
        if (app) await app.stop();
        app = undefined;
    });

    describe('static dir support', () => {
        beforeEach(async () => {
            await makeDir(STATIC_DIR);
        });

        afterEach(async () => {
            await removeDir(STATIC_DIR);
        });

        const staticDirSupportTests = {
            'should serve configurations': {
                conf: {
                    app: {
                        routing: {
                            dirs: {
                                '/': `${STATIC_DIR}/root`,
                                '/assets': { path: `${STATIC_DIR}/assets` },
                                '/assets/js': [
                                    `${STATIC_DIR}/js`,
                                    { path: `${STATIC_DIR}/js2` }
                                ]
                            }
                        }
                    }
                },
                make: [
                    'root/index.html',
                    'assets/style.css',
                    'js/app.js',
                    'js2/site.js'
                ],
                tests: {
                    200: [
                        'index.html',
                        'assets/style.css',
                        'assets/js/app.js',
                        'assets/js/site.js'
                    ]
                }
            },
            'should resolve against CWD': {
                conf: {
                    app: {
                        routing: {
                            dirs: {
                                '/': `${STATIC_DIR}/public/files`.split(
                                    `${process.cwd()}/`
                                )[1]
                            }
                        }
                    }
                },
                make: ['public/files/index.html'],
                tests: { 404: ['public/files/index.html'], 200: ['index.html'] }
            }
        };

        for (let [key, { conf, make, tests }] of Object.entries(
            staticDirSupportTests
        )) {
            it(key, async () => {
                for (let target of make) {
                    await makeDir(dirname(`${STATIC_DIR}/${target}`));
                    await writeTextFile(`${STATIC_DIR}/${target}`, key);
                }

                app = await createApp(conf);

                for (let [status, specs] of Object.entries(tests)) {
                    for (let test of specs) {
                        let res = await agent.get(test);
                        expect(res.status).toBe(Number(status));
                        if (res.status === 200) expect(res.data).toBe(key);
                    }
                }
            });
        }
    });
});
