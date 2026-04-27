"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const mongoose_1 = require("mongoose");
const refreshTokenSchema = new mongoose_1.Schema({
    adminId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    replacedByTokenHash: { type: String },
    revokedAt: { type: Date },
    expiresAt: { type: Date, required: true },
    createdByIp: { type: String },
    revokedByIp: { type: String },
}, { timestamps: true });
exports.RefreshToken = (0, mongoose_1.model)("RefreshToken", refreshTokenSchema);
