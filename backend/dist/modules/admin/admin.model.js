"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const mongoose_1 = require("mongoose");
const adminSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: ["owner"],
        default: "owner",
        immutable: true,
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
}, { timestamps: true });
exports.Admin = (0, mongoose_1.model)("Admin", adminSchema);
