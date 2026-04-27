"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const agentSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."]
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    whatsapp: {
        type: String,
        trim: true,
        default: ""
    },
    photoUrl: {
        type: String,
        trim: true,
        default: ""
    },
    designation: {
        type: String,
        trim: true,
        default: "Real Estate Agent"
    },
    bio: {
        type: String,
        trim: true,
        default: ""
    },
    socialMedia: {
        facebook: { type: String, trim: true, default: "" },
        linkedin: { type: String, trim: true, default: "" },
        twitter: { type: String, trim: true, default: "" },
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, { timestamps: true });
exports.Agent = mongoose_1.default.models.Agent || mongoose_1.default.model("Agent", agentSchema);
