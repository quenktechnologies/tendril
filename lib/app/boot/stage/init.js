"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitStage = void 0;
/**
 * InitStage of Application boot.
 *
 * Invokes the init hooks of all modules.
 */
class InitStage {
    constructor(hooks) {
        this.hooks = hooks;
        this.name = 'init';
    }
    execute() {
        return this.hooks.init();
    }
}
exports.InitStage = InitStage;
//# sourceMappingURL=init.js.map