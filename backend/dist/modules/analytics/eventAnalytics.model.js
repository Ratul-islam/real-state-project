"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingEvent = exports.ListingEventTypes = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.ListingEventTypes = [
    "page_view",
    "contact_click",
    "share_click",
    "save_click",
];
const ListingEventSchema = new mongoose_1.Schema({
    listingId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    type: { type: String, enum: exports.ListingEventTypes, required: true, index: true },
    visitorId: { type: String, required: true, index: true },
    referrer: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    ts: { type: Date, default: Date.now, index: true },
}, { timestamps: false });
ListingEventSchema.index({ listingId: 1, type: 1, visitorId: 1, ts: -1 });
exports.ListingEvent = mongoose_1.default.models.ListingEvent || mongoose_1.default.model("ListingEvent", ListingEventSchema);
