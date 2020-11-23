import { assert } from '@quenk/test/lib/assert';
import { Type } from '@quenk/noni/lib/data/type';

import {
    PRSStorage
} from '../../../../../lib/app/api/storage/prs';

describe('prs', () => {

    describe('PRSStorage', () => {

        describe('get', () => {

            it('should retreive values', () => {

                let s = new PRSStorage({ value: 12 });
                let mvalue = s.get('value');

                assert(mvalue.isJust()).true();
                assert(mvalue.get()).equal(12);

            });

        });

        describe('getOrElse', () => {

            it('should retreive values', () => {

                let s = new PRSStorage({ value: 12 });
                let value = s.getOrElse('value', 0);

                assert(value).equal(12);

            });

            it('should provide the alternative', () => {

                let s = new PRSStorage({});
                let value = s.getOrElse('value', 10);

                assert(value).equal(10);

            });

        });

        describe('set', () => {

            it('should set values', () => {

                let s = new PRSStorage({});

                s.set('value', 12);
                assert(s.data['value']).equal(12);

            });

        });

        describe('exists', () => {

            it('should work', () => {

                let s = new PRSStorage({value:12});

                assert(s.exists('value')).true();
                assert(s.exists('value2')).false();

            });

        });

        describe('remove', () => {

            it('should delete prs keys', () => {

                let s = new PRSStorage({ value: 12, value2: 10 });

                s.remove('value');

                assert(s.data['value']).undefined();

                assert(s.data['value2']).equal(10);

            });
        });
    });
});
