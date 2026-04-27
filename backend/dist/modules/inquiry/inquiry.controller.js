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
exports.deleteInquiryHandler = exports.updateInquiryStatusHandler = exports.getInquiryByIdHandler = exports.getInquiriesHandler = exports.createInquiryHandler = void 0;
const inquiryService = __importStar(require("./inquiry.service.js"));
const responses_js_1 = require("../../utils/responses.js");
const createInquiryHandler = async (req, reply) => {
    try {
        const inquiry = await inquiryService.createInquiry(req.body);
        return (0, responses_js_1.sendSuccess)(reply, {
            statusCode: 201,
            message: "Inquiry sent successfully",
            data: inquiry
        });
    }
    catch (error) {
        return (0, responses_js_1.sendError)(reply, {
            statusCode: 400,
            message: "Failed to send inquiry",
            errors: error.message
        });
    }
};
exports.createInquiryHandler = createInquiryHandler;
const getInquiriesHandler = async (req, reply) => {
    try {
        const data = await inquiryService.getInquiries(req.query);
        return (0, responses_js_1.sendSuccess)(reply, { statusCode: 200, message: "Inquiries fetched", data });
    }
    catch (error) {
        return (0, responses_js_1.sendError)(reply, { statusCode: 500, message: "Error fetching inquiries" });
    }
};
exports.getInquiriesHandler = getInquiriesHandler;
const getInquiryByIdHandler = async (req, reply) => {
    try {
        const data = await inquiryService.getInquiryById(req.params.id);
        return (0, responses_js_1.sendSuccess)(reply, { statusCode: 200, message: "Inquiry fetched", data });
    }
    catch (error) {
        return (0, responses_js_1.sendError)(reply, { statusCode: error.statusCode || 500, message: error.message });
    }
};
exports.getInquiryByIdHandler = getInquiryByIdHandler;
const updateInquiryStatusHandler = async (req, reply) => {
    try {
        const data = await inquiryService.updateInquiryStatus(req.params.id, req.body.status);
        return (0, responses_js_1.sendSuccess)(reply, { statusCode: 200, message: "Status updated", data });
    }
    catch (error) {
        return (0, responses_js_1.sendError)(reply, { statusCode: error.statusCode || 400, message: error.message });
    }
};
exports.updateInquiryStatusHandler = updateInquiryStatusHandler;
const deleteInquiryHandler = async (req, reply) => {
    try {
        await inquiryService.deleteInquiry(req.params.id);
        return (0, responses_js_1.sendSuccess)(reply, { statusCode: 200, message: "Inquiry deleted" });
    }
    catch (error) {
        return (0, responses_js_1.sendError)(reply, { statusCode: error.statusCode || 500, message: error.message });
    }
};
exports.deleteInquiryHandler = deleteInquiryHandler;
