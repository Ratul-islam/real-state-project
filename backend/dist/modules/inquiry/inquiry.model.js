"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inquiry = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const inquirySchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    listing: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Listing",
        required: false,
        index: true,
    },
    agent: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Agent",
        required: false,
        index: true,
    },
    status: {
        type: String,
        enum: ["pending", "contacted", "resolved", "archived"],
        default: "pending",
        index: true,
    },
}, { timestamps: true });
exports.Inquiry = mongoose_1.default.models.Inquiry || mongoose_1.default.model("Inquiry", inquirySchema);
