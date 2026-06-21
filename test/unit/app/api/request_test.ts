import { assert } from '@quenk/test/lib/assert';
import { Type } from '@quenk/noni/lib/data/type';

import { mkRequestMessage } from '../../../../lib/app/api/request';

describe('request', () => {
    describe('mkRequestMessage', () => {
        it('should proxy values to prs', () => {
            let request = <Type>{
                method: 'GET',
                path: '/',
                url: '/',
                params: {},
                query: {},
                body: undefined,
                cookies: {},
                hostname: 'localhost',
                ip: '127.0.0.1',
                protocol: 'http'
            };

            let response = <Type>{};
            let msg = mkRequestMessage(request, response);

            assert(msg.values).equal(msg.prs.values);

            (<Type>msg.values).level = 12;

            assert(msg.prs.get('level').isJust()).true();
            assert(msg.prs.get('level').get()).equal(12);
            assert((<Type>msg.values).level).equal(12);

            msg.prs.set('mode', 'test');

            assert((<Type>msg.values).mode).equal('test');
        });
    });
});
