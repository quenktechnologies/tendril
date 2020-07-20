"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StageBundle = void 0;
var future_1 = require("@quenk/noni/lib/control/monad/future");
/**
 * StageBundle combines various Stages into a single sequential Stage
 * implementation.
 *
 * The execute() method executes each member of the bundle one at a time,
 * updating the name property each time one completes.
 */
var StageBundle = /** @class */ (function () {
    function StageBundle(stages) {
        this.stages = stages;
        this.name = '<bundle>';
    }
    StageBundle.prototype.execute = function () {
        var _this = this;
        var stages = this.stages.map(function (s) {
            return s
                .execute()
                .map(function () { _this.name = s.name; });
        });
        return future_1.sequential(stages);
    };
    return StageBundle;
}());
exports.StageBundle = StageBundle;
//# sourceMappingURL=index.js.map