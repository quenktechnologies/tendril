"use strict";
exports.__esModule = true;
exports.LogStage = void 0;
var morgan = require("morgan");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var record_1 = require("@quenk/noni/lib/data/record");
var defaultApitions = {
    format: 'combined'
};
/**
 * LogStage configures the morgan middleware to log incomming requests.
 */
var LogStage = /** @class */ (function () {
    function LogStage(modules) {
        this.modules = modules;
        this.name = 'log';
    }
    LogStage.prototype.execute = function () {
        var modules = this.modules;
        record_1.map(modules, function (m) {
            if (m.template &&
                m.template.app &&
                m.template.app.log &&
                m.template.app.log.enable) {
                var conf = record_1.merge(defaultApitions, m.template.app.log);
                m.app.use(morgan(conf.format, conf.options));
            }
        });
        return future_1.pure(undefined);
    };
    return LogStage;
}());
exports.LogStage = LogStage;
