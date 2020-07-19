"use strict";
exports.__esModule = true;
exports.BodyParserStage = void 0;
var parser = require("body-parser");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var record_1 = require("@quenk/noni/lib/data/record");
/**
 * BodyParserStage configures middleware for parsing request bodies into desired
 * values.
 */
var BodyParserStage = /** @class */ (function () {
    function BodyParserStage(modules) {
        this.modules = modules;
        this.name = 'body-parser';
    }
    BodyParserStage.prototype.execute = function () {
        var modules = this.modules;
        record_1.map(modules, function (m) {
            var app = m.app;
            if (m.template &&
                m.template.app &&
                m.template.app.parser &&
                m.template.app.parser.body) {
                var body = m.template.app.parser.body;
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
    };
    return BodyParserStage;
}());
exports.BodyParserStage = BodyParserStage;
