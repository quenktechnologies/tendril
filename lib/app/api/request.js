"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRequest = void 0;
const session_1 = require("./storage/session");
const prs_1 = require("./storage/prs");
/**
 * ClientRequest class.
 */
class ClientRequest {
    constructor(method, url, path, params, query, body, cookies, signedCookies, hostname, remoteAddress, protocol, prs, session, expressRequest) {
        this.method = method;
        this.url = url;
        this.path = path;
        this.params = params;
        this.query = query;
        this.body = body;
        this.cookies = cookies;
        this.signedCookies = signedCookies;
        this.hostname = hostname;
        this.remoteAddress = remoteAddress;
        this.protocol = protocol;
        this.prs = prs;
        this.session = session;
        this.expressRequest = expressRequest;
    }
    /**
     * fromExpress constructs a ClientRequest from the express framework's
     * Request object.
     */
    static fromExpress(r) {
        return new ClientRequest(r.method, r.url, r.path, r.params, r.query, r.body, r.cookies, r.signedCookies, r.hostname, r.ip, r.protocol, new prs_1.PRSStorage(), session_1.EnabledSessionStorage.fromExpress(r), r);
    }
    toExpress() {
        return this.expressRequest;
    }
}
exports.ClientRequest = ClientRequest;
//# sourceMappingURL=request.js.map