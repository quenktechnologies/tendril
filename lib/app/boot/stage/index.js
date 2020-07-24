"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StageBundle = void 0;
const future_1 = require("@quenk/noni/lib/control/monad/future");
/**
 * StageBundle combines various Stages into a single sequential Stage
 * implementation.
 *
 * The execute() method executes each member of the bundle one at a time,
 * updating the name property each time one completes.
 */
class StageBundle {
    constructor(stages) {
        this.stages = stages;
        this.name = '<bundle>';
    }
    execute() {
        let stages = this.stages.map(s => s
            .execute()
            .map(() => { this.name = s.name; }));
        return future_1.sequential(stages);
    }
}
exports.StageBundle = StageBundle;
//# sourceMappingURL=index.js.map