"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyParserStage = void 0;
const parser = require("body-parser");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const record_1 = require("@quenk/noni/lib/data/record");
/**
 * BodyParserStage configures middleware for parsing request bodies into desired
 * values.
 */
class BodyParserStage {
    constructor(modules) {
        this.modules = modules;
        this.name = 'body-parser';
    }
    execute() {
        let { modules } = this;
        record_1.map(modules, m => {
            let { app } = m;
            if (m.template &&
                m.template.app &&
                m.template.app.parsers &&
                m.template.app.parsers.body) {
                let { body } = m.template.app.parsers;
                if (body.json && body.json.enable)
                    app.use(parser.json(body.json.options));
                if (body.raw && body.raw.enable)
                    app.use(parser.raw(body.raw.options));
                if (body.text && body.text.enable)
                    app.use(parser.text(body.text.options));
                if (body.urlencoded && body.urlencoded.enable)
                    app.use(parser.urlencoded(body.urlencoded.options));
            }
        });
        return future_1.pure(undefined);
    }
}
exports.BodyParserStage = BodyParserStage;
//# sourceMappingURL=body-parser.js.map