"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIP = getIP;
function getIP(request) {
    const xForwardedFor = request.headers["x-forwarded-for"];
    if (typeof xForwardedFor === "string") {
        return xForwardedFor.split(",")[0].trim();
    }
    return request.ip;
}
