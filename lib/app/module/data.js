"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValue = exports.getModule = void 0;
const maybe_1 = require("@quenk/noni/lib/data/maybe");
/**
 * getModule provides a module given an address.
 */
const getModule = (data, addr) => maybe_1.fromNullable(data[addr]);
exports.getModule = getModule;
/**
 * getValue from a ModuleData looking up the value on the parent recursively
 * if not found on first try.
 *
 * Think of this function as prototype inheritance for tendril ModuleDatas.
 */
const getValue = (mData, f) => {
    let current = mData;
    let result;
    while (true) {
        result = f(current);
        if (result != null)
            break;
        else if (current.parent.isJust())
            current = current.parent.get();
        else
            break;
    }
    return result;
};
exports.getValue = getValue;
//# sourceMappingURL=data.js.map