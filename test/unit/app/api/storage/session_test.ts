import * as session from '../../../../../lib/app/api/storage/session';

import { assert } from '@quenk/test/lib/assert';
import { Object } from '@quenk/noni/lib/data/jsonx';

describe('session', () => {

    describe('getSessionValue', () => {

        it('should retreive session values', () => {

            let sdata = { [session.SESSION_DATA]: { value: 12 } };
            let mvalue = session.getSessionValue(sdata, 'value');

            assert(mvalue.isJust()).true();
            assert(mvalue.get()).equal(12);

        });

    });

    describe('getSessionValueAsString', () => {

        it('should retreive values as strings', () => {

            let sdata = { [session.SESSION_DATA]: { value: 12 } };
            let value = session.getSessionValueAsString(sdata, 'value');

            assert(value).equal('12');

        });

    });

    describe('getSessionValueOrElse', () => {

        it('should retreive values', () => {

            let sdata = { [session.SESSION_DATA]: { value: 12 } };
            let value = session.getSessionValueOrElse(sdata, 'value', 10);

            assert(value).equal(12);

        });

        it('should retreive values', () => {

            let sdata = { [session.SESSION_DATA]: { value: 12 } };
            let value = session.getSessionValueOrElse(sdata, 'val', 10);

            assert(value).equal(10);

        });
    });

    describe('setSessionValue', () => {

        it('should set session values and  descriptors', () => {

            let sdata: Object = { [session.SESSION_DATA]: <Object>{} };

            session.setSessionValue(sdata, 'value', 12, { ttl: 10 });
            assert(sdata[session.SESSION_DATA]['value']).equal(12);
            assert(sdata[session.SESSION_DESCRIPTORS]['value']).equate({
                ttl: 10
            });

        });

    });

    describe('deleteSessionKey', () => {

        it('should delete session keys', () => {

            let sdata: Object = {

                [session.SESSION_DATA]: {

                    value: 12,

                    value2: 10

                }

            };

            session.deleteSessionKey(sdata, 'value');
            assert(sdata[session.SESSION_DATA]['value']).undefined();
            assert(sdata[session.SESSION_DATA]['value2']).equal(10);

        });

    });

});
