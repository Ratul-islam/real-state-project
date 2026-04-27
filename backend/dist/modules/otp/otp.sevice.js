"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.createOTP = void 0;
const otp_model_js_1 = require("./otp.model.js");
const AppError_js_1 = require("../../utils/AppError.js");
const createOTP = async (userId, type, length = 6, expiresInMinutes = 10) => {
    await otp_model_js_1.OTPModel.deleteOne({ "userId": userId, "type": type });
    const otp = Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1))).toString();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    await otp_model_js_1.OTPModel.create({ userId, otp, type, expiresAt });
    return otp;
};
exports.createOTP = createOTP;
const verifyOTP = async (userId, otp, type) => {
    const otpRecord = await otp_model_js_1.OTPModel.findOne({ userId, otp, type });
    if (!otpRecord)
        throw new AppError_js_1.AppError('Invalid OTP', 400);
    if (otpRecord.expiresAt < new Date())
        throw new AppError_js_1.AppError('OTP expired', 400);
    await otp_model_js_1.OTPModel.deleteOne({ _id: otpRecord._id });
    return true;
};
exports.verifyOTP = verifyOTP;
