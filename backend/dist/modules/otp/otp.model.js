"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const otpSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: 'Admin' },
    otp: { type: String, required: true },
    type: { type: String, enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'TWO_FA'], required: true },
    expiresAt: { type: Date, required: true },
});
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.OTPModel = mongoose_1.default.model('OTP', otpSchema);
