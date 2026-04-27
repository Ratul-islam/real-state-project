"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyPasswordResetOtp = exports.requestPasswordReset = exports.logout = exports.renewToken = exports.login = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const util_js_1 = require("../../utils/util.js");
const getIp_js_1 = require("../../utils/getIp.js");
const admin_services_js_1 = require("../admin/admin.services.js");
const otp_sevice_js_1 = require("../otp/otp.sevice.js");
const responses_js_1 = require("../../utils/responses.js");
const notification_service_js_1 = require("../notification/notification.service.js");
const refreshToken_services_js_1 = require("./refreshToken.services.js");
const signup = async (request, reply, app) => {
    const { email, password, name } = request.body;
    await (0, admin_services_js_1.createAdmin)({ email, password, name });
    return (0, responses_js_1.sendSuccess)(reply, { message: "Admin created successfully" });
};
exports.signup = signup;
const login = async (request, reply, app) => {
    const { email, password } = request.body;
    const admin = await (0, admin_services_js_1.getAdmin)({ email });
    if (!admin || !admin.isActive) {
        return (0, responses_js_1.sendError)(reply, { message: "No admin asociated with the email" });
    }
    const ok = await bcrypt_1.default.compare(password, admin.password);
    if (!ok)
        return reply.code(401).send({ message: "Invalid credentials" });
    admin.lastLoginAt = new Date();
    await admin.save();
    const accessToken = app.jwt.access.sign({
        sub: admin._id.toString(),
        role: admin.role,
    });
    const refreshToken = app.jwt.refresh.sign({
        sub: admin._id.toString(),
    });
    const refreshHash = (0, util_js_1.sha256)(refreshToken);
    await (0, refreshToken_services_js_1.createRefreshToken)(admin._id, refreshHash, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), (0, getIp_js_1.getIP)(request));
    reply.setCookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
    });
    reply.setCookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 15 * 60,
    });
    return (0, responses_js_1.sendSuccess)(reply, { data: { accessToken, refreshToken } });
};
exports.login = login;
const renewToken = async (request, reply, app) => {
    const { refreshToken } = request.body;
    let payload;
    try {
        payload = await app.jwt.refresh.verify(refreshToken);
    }
    catch {
        return (0, responses_js_1.sendError)(reply, {
            statusCode: 401,
            message: "Invalid refresh token",
        });
    }
    const refreshHash = (0, util_js_1.sha256)(refreshToken);
    const stored = await (0, refreshToken_services_js_1.findRefreshToken)(refreshHash);
    if (!stored)
        return (0, responses_js_1.sendError)(reply, {
            statusCode: 401,
            message: "Refresh token not found",
        });
    if (stored.revokedAt)
        return (0, responses_js_1.sendError)(reply, {
            statusCode: 401,
            message: "Refresh token revoked",
        });
    if (stored.expiresAt.getTime() < Date.now()) {
        return (0, responses_js_1.sendError)(reply, {
            statusCode: 401,
            message: "Refresh token expired",
        });
    }
    const adminId = payload.sub;
    const newAccessToken = app.jwt.access.sign({ sub: adminId, role: "owner" });
    const newRefreshToken = app.jwt.refresh.sign({ sub: adminId, role: "owner" });
    const newRefreshHash = (0, util_js_1.sha256)(newRefreshToken);
    stored.revokedAt = new Date();
    stored.revokedByIp = (0, getIp_js_1.getIP)(request);
    stored.replacedByTokenHash = newRefreshHash;
    await stored.save();
    await (0, refreshToken_services_js_1.createRefreshToken)(adminId, newRefreshHash, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), (0, getIp_js_1.getIP)(request));
    reply.setCookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
    });
    reply.setCookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
    });
    return (0, responses_js_1.sendSuccess)(reply, {
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
};
exports.renewToken = renewToken;
const logout = async (request, reply) => {
    const { refreshToken } = request.headers;
    console.log(request.headers);
    const refreshHash = (0, util_js_1.sha256)(refreshToken);
    const stored = await (0, refreshToken_services_js_1.findRefreshToken)(refreshHash);
    if (stored && !stored.revokedAt) {
        stored.revokedAt = new Date();
        stored.revokedByIp = (0, getIp_js_1.getIP)(request);
        await stored.save();
    }
    return (0, responses_js_1.sendSuccess)(reply, { message: "successfully logged out" });
};
exports.logout = logout;
const requestPasswordReset = async (request, reply, app) => {
    const { email } = request.body;
    const admin = await (0, admin_services_js_1.getAdmin)({ email });
    if (!admin || !admin.isActive)
        return (0, responses_js_1.sendError)(reply, { message: "No admin found", statusCode: 404 });
    const expiresInMinutes = 10;
    const otp = await (0, otp_sevice_js_1.createOTP)(admin._id, "PASSWORD_RESET", 6, expiresInMinutes);
    await (0, notification_service_js_1.sendOTPEmail)(app, admin.email, otp, "PASSWORD_RESET", expiresInMinutes);
    return (0, responses_js_1.sendSuccess)(reply, { message: "Verification email sent!" });
};
exports.requestPasswordReset = requestPasswordReset;
const verifyPasswordResetOtp = async (request, reply, app) => {
    const { email, otp } = request.body;
    const admin = await (0, admin_services_js_1.getAdmin)({ email });
    if (!admin || !admin.isActive) {
        return (0, responses_js_1.sendError)(reply, { statusCode: 401, message: "Invalid OTP" });
    }
    try {
        await (0, otp_sevice_js_1.verifyOTP)(admin._id, otp, "PASSWORD_RESET");
    }
    catch {
        return reply.code(400).send({ message: "Invalid OTP" });
    }
    const resetToken = app.jwt.reset.sign({
        sub: admin._id.toString(),
        typ: "password_reset",
    });
    return (0, responses_js_1.sendSuccess)(reply, { data: { resetToken } });
};
exports.verifyPasswordResetOtp = verifyPasswordResetOtp;
const resetPassword = async (request, reply, app) => {
    const { resetToken, newPassword } = request.body;
    let payload;
    try {
        payload = app.jwt.reset.verify(resetToken);
    }
    catch {
        return (0, responses_js_1.sendError)(reply, {
            statusCode: 401,
            message: "Invalid or expired reset token",
        });
    }
    if (payload?.typ !== "password_reset") {
        return (0, responses_js_1.sendError)(reply, {
            statusCode: 401, message: "Invalid reset token"
        });
    }
    const adminId = payload.sub;
    const admin = await (0, admin_services_js_1.getAdmin)({ id: adminId });
    if (!admin || !admin.isActive) {
        return (0, responses_js_1.sendError)(reply, {
            statusCode: 400, message: "Invalid reset token"
        });
    }
    admin.password = await bcrypt_1.default.hash(newPassword, 12);
    await admin.save();
    await (0, refreshToken_services_js_1.revokeAllToken)(admin._id, (0, getIp_js_1.getIP)(request));
    return (0, responses_js_1.sendSuccess)(reply, { message: "Success" });
};
exports.resetPassword = resetPassword;
