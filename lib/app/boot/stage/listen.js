"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenStage = void 0;
const future_1 = require("@quenk/noni/lib/control/monad/future");
const monad_1 = require("@quenk/noni/lib/control/monad");
/**
 * ListenStage starts the HTTP server to accept remote connections.
 *
 * This will also dispatch the "started" event.
 */
class ListenStage {
    constructor(server, hooks, mainProvider) {
        this.server = server;
        this.hooks = hooks;
        this.mainProvider = mainProvider;
        this.name = 'listen';
    }
    execute() {
        let { mainProvider, server, hooks } = this;
        return monad_1.doN(function* () {
            let mmodule = mainProvider();
            if (mmodule.isJust())
                yield future_1.parallel([
                    server.listen(mmodule.get().app).map(() => { }),
                    hooks.started()
                ]);
            else
                yield future_1.raise(new Error('Server not initialized!'));
            return future_1.pure(undefined);
        });
    }
}
exports.ListenStage = ListenStage;
//# sourceMappingURL=listen.js.map