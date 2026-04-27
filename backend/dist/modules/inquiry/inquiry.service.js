"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInquiry = exports.updateInquiryStatus = exports.getInquiryById = exports.getInquiries = exports.createInquiry = void 0;
const inquiry_model_js_1 = require("./inquiry.model.js");
const AppError_js_1 = require("../../utils/AppError.js");
const createInquiry = async (payload) => {
    const newInquiry = new inquiry_model_js_1.Inquiry(payload);
    return await newInquiry.save();
};
exports.createInquiry = createInquiry;
const getInquiries = async (query) => {
    const filter = {};
    if (query.status)
        filter.status = query.status;
    if (query.agent)
        filter.agent = query.agent;
    if (query.listing)
        filter.listing = query.listing;
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(query.limit || 10)));
    const skip = (page - 1) * limit;
    const [inquiries, total] = await Promise.all([
        inquiry_model_js_1.Inquiry.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("listing", "title slug media.cover.url")
            .populate("agent", "name email phone photoUrl")
            .lean()
            .exec(),
        inquiry_model_js_1.Inquiry.countDocuments(filter).exec(),
    ]);
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        inquiries,
    };
};
exports.getInquiries = getInquiries;
const getInquiryById = async (id) => {
    const inquiry = await inquiry_model_js_1.Inquiry.findById(id)
        .populate("listing", "title slug")
        .populate("agent", "name email phone photoUrl")
        .lean()
        .exec();
    if (!inquiry)
        throw new AppError_js_1.AppError("Inquiry not found", 404);
    return inquiry;
};
exports.getInquiryById = getInquiryById;
const updateInquiryStatus = async (id, status) => {
    const validStatuses = ["pending", "contacted", "resolved", "archived"];
    if (!validStatuses.includes(status)) {
        throw new AppError_js_1.AppError("Invalid status", 400);
    }
    const updated = await inquiry_model_js_1.Inquiry.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean().exec();
    if (!updated)
        throw new AppError_js_1.AppError("Inquiry not found", 404);
    return updated;
};
exports.updateInquiryStatus = updateInquiryStatus;
const deleteInquiry = async (id) => {
    const deleted = await inquiry_model_js_1.Inquiry.findByIdAndDelete(id).exec();
    if (!deleted)
        throw new AppError_js_1.AppError("Inquiry not found", 404);
    return deleted;
};
exports.deleteInquiry = deleteInquiry;
