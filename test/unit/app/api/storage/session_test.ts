import * as session from '../../../../../lib/app/api/storage/session';

import { assert } from '@quenk/test/lib/assert';
import { Object } from '@quenk/noni/lib/data/jsonx';
import { Type } from '@quenk/noni/lib/data/type';

import {
    EnabledSessionStorage,
    DisabledSessionStorage,
    SESSION_DATA
} from '../../../../../lib/app/api/storage/session';

describe('session', () => {
    describe('EnabledSessionStorage', () => {
        describe('fromExpress', function () {
            it('should return EnabledSessionStorage when session enabled', () => {
                let request = <Type>{ session: {} };
                let session = EnabledSessionStorage.fromExpress(request);

                assert(session).instance.of(EnabledSessionStorage);
            });

            it('should return DisabledSessionStorage when session disabled', () => {
                let request = <Type>{};
                let session = EnabledSessionStorage.fromExpress(request);

                assert(session).instance.of(DisabledSessionStorage);
            });
        });

        describe('get', () => {
            it('should retreive values', () => {
                let sessionData = { [session.SESSION_DATA]: { value: 12 } };
                let s = new EnabledSessionStorage(sessionData);
                let mvalue = s.get('value');

                assert(mvalue.isJust()).true();
                assert(mvalue.get()).equal(12);
            });
        });

        describe('getOrElse', () => {
            it('should retreive values', () => {
                let sessionData = { [session.SESSION_DATA]: { value: 12 } };
                let s = new EnabledSessionStorage(sessionData);
                let value = s.getOrElse('value', 0);

                assert(value).equal(12);
            });

            it('should provide the alternative', () => {
                let sessionData = { [session.SESSION_DATA]: {} };
                let s = new EnabledSessionStorage(sessionData);
                let value = s.getOrElse('value', 10);

                assert(value).equal(10);
            });
        });

        describe('getAll', () => {
            it('should return all values', () => {
                let s = new EnabledSessionStorage({
                    [SESSION_DATA]: { level: 12 }
                });

                assert(s.getAll()).equate({ level: 12 });
            });

            it('should return a copy', () => {
                let s = new EnabledSessionStorage({
                    [SESSION_DATA]: {
                        level: 12
                    }
                });

                let values = s.getAll();

                s.set('level', 1);

                assert(values).equate({ level: 12 });
            });
        });

        describe('set', () => {
            it('should set session values', () => {
                let sessionData = <Type>{ [session.SESSION_DATA]: <Object>{} };
                let s = new EnabledSessionStorage(sessionData);

                s.set('value', 12);

                assert(sessionData[session.SESSION_DATA]['value']).equal(12);

                assert(
                    sessionData[session.SESSION_DESCRIPTORS]['value']
                ).equate({});
            });
        });

        describe('setWithDescriptor', () => {
            it('should set session values with descriptors', () => {
                let sessionData = <Type>{ [session.SESSION_DATA]: <Object>{} };
                let s = new EnabledSessionStorage(sessionData);

                s.setWithDescriptor('value', 12, { ttl: 10 });

                session.setSessionValue(sessionData, 'value', 12, { ttl: 10 });

                assert(sessionData[session.SESSION_DATA]['value']).equal(12);

                assert(
                    sessionData[session.SESSION_DESCRIPTORS]['value']
                ).equate({
                    ttl: 10
                });
            });
        });

        describe('exists', () => {
            it('should work', () => {
                let sessionData = <Type>{
                    [session.SESSION_DATA]: <Object>{ value: 12 }
                };

                let s = new EnabledSessionStorage(sessionData);

                assert(s.exists('value')).true();
                assert(s.exists('value2')).false();
            });
        });

        describe('remove', () => {
            it('should delete session keys', () => {
                let sessionData: Type = {
                    [session.SESSION_DATA]: {
                        value: 12,

                        value2: 10
                    }
                };

                let s = new EnabledSessionStorage(sessionData);

                s.remove('value');

                assert(sessionData[session.SESSION_DATA]['value']).undefined();

                assert(sessionData[session.SESSION_DATA]['value2']).equal(10);
            });
        });
    });
});
