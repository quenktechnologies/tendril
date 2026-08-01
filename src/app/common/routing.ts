import { Object } from '@quenk/noni/lib/data/jsonx';
import { Path } from '@quenk/noni/lib/io/file';

/**
 * resolveRoutePath resolves a route path that may reference a tag value.
 *
 * If path begins with a "$", the rest of the string is used as a key to
 * look up a value in tags. If a value is found it is cast to a string and
 * used as the path, otherwise path is used as specified.
 */
export const resolveRoutePath = (tags: Object, path: Path): Path => {
    if (path.charAt(0) !== '$') return path;

    let value = tags[path.slice(1)];

    return value === undefined ? path : String(value);
};
