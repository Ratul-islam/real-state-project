"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeAllToken = exports.findRefreshToken = exports.createRefreshToken = void 0;
const refreshToken_model_js_1 = require("./refreshToken.model.js");
const createRefreshToken = async (adminId, tokenHash, expiresAt, createdByIp) => {
    await refreshToken_model_js_1.RefreshToken.create({
        adminId,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp
    });
};
exports.createRefreshToken = createRefreshToken;
const findRefreshToken = async (refreshHash) => {
    return refreshToken_model_js_1.RefreshToken.findOne({ tokenHash: refreshHash }).exec();
};
exports.findRefreshToken = findRefreshToken;
const revokeAllToken = async (adminId, ip) => {
    await refreshToken_model_js_1.RefreshToken.updateMany({ userId: adminId, revokedAt: null }, { $set: { revokedAt: new Date(), revokedByIp: ip } });
};
exports.revokeAllToken = revokeAllToken;
