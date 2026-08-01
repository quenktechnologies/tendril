import { Object } from '@quenk/noni/lib/data/jsonx';

export const TAGS_METADATA_KEY = Symbol('tendril.tags');

/**
 * DecoratedTagsClass types the constructor for classes that have been
 * decorated with @Tags.
 */
export interface DecoratedTagsClass {
    [TAGS_METADATA_KEY]?: Object;
}

/**
 * MethodTags maps a method's property key to the tags attached to it via
 * @Tags.
 */
export interface MethodTags {
    [key: string]: Object;
    [key: symbol]: Object;
}

/**
 * DecoratedTagsController types an instance whose methods have been
 * decorated with @Tags.
 */
export interface DecoratedTagsController {
    [TAGS_METADATA_KEY]?: MethodTags;
}

/**
 * Tags is a decorator that attaches tags to a class or one of its methods.
 *
 * At the class level, the tags are merged into the module's tags
 * (ModuleConf.app.tags). At the method level, the tags are merged into the
 * tags of the route(s) declared on that method by @Get, @Post etc.
 *
 * Usage:
 *   @Tags({ area: 'admin' })
 *   class AdminModule {
 *     @Tags({ role: 'owner' })
 *     @Get('/users')
 *     list(ctx: RequestContext) { ... }
 *   }
 *
 * @param tags - The tags to attach.
 */
export const Tags =
    (tags: Object) =>
    (
        target: unknown,
        context: ClassDecoratorContext | ClassMethodDecoratorContext
    ): void => {
        if (context.kind === 'class') {
            let klass = target as DecoratedTagsClass;
            klass[TAGS_METADATA_KEY] = { ...klass[TAGS_METADATA_KEY], ...tags };
            return;
        }

        context.addInitializer(function (this: unknown) {
            let existing =
                (this as DecoratedTagsController)[TAGS_METADATA_KEY] ?? {};

            existing[context.name] = { ...existing[context.name], ...tags };

            (this as DecoratedTagsController)[TAGS_METADATA_KEY] = existing;
        });
    };
