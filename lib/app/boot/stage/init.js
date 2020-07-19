"use strict";
exports.__esModule = true;
exports.InitStage = void 0;
/**
 * InitStage of Application boot.
 *
 * Invokes the init hooks of all modules.
 */
var InitStage = /** @class */ (function () {
    function InitStage(hooks) {
        this.hooks = hooks;
        this.name = 'init';
    }
    InitStage.prototype.execute = function () {
        return this.hooks.init();
    };
    return InitStage;
}());
exports.InitStage = InitStage;
