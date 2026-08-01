import { resolveRoutePath } from '../../../../lib/app/common/routing';

describe('common/routing', () => {
    describe('resolveRoutePath', () => {
        it('returns the path unchanged when it does not begin with "$"', () => {
            expect(resolveRoutePath({}, '/users')).toBe('/users');
        });

        it('resolves the path from tags when it begins with "$"', () => {
            expect(resolveRoutePath({ pathName: '/users' }, '$pathName')).toBe(
                '/users'
            );
        });

        it('returns the path as specified when the tag is not found', () => {
            expect(resolveRoutePath({}, '$pathName')).toBe('$pathName');
        });

        it('casts a found non-string value to a string', () => {
            expect(resolveRoutePath({ id: 123 }, '$id')).toBe('123');
            expect(resolveRoutePath({ flag: true }, '$flag')).toBe('true');
        });

        it('treats a null tag value as found and casts it to a string', () => {
            expect(resolveRoutePath({ value: null }, '$value')).toBe('null');
        });
    });
});
