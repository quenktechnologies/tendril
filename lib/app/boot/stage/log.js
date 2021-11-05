"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogStage = void 0;
const morgan = require("morgan");
const future_1 = require("@quenk/noni/lib/control/monad/future");
const record_1 = require("@quenk/noni/lib/data/record");
const defaultOptions = {
    format: 'combined'
};
/**
 * LogStage configures the morgan middleware to log incomming requests.
 */
class LogStage {
    constructor(modules) {
        this.modules = modules;
        this.name = 'log';
    }
    execute() {
        let { modules } = this;
        return (0, future_1.fromCallback)(cb => {
            (0, record_1.map)(modules, m => {
                if (m.template &&
                    m.template.app &&
                    m.template.app.log &&
                    m.template.app.log.enable) {
                    let conf = (0, record_1.merge)(defaultOptions, m.template.app.log);
                    m.app.use(morgan(conf.format, conf.options));
                }
            });
            cb(null);
        });
    }
}
exports.LogStage = LogStage;
//# sourceMappingURL=log.js.map