import { Inquiry } from "./inquiry.model.js";
import { AppError } from "../../utils/AppError.js";

export const createInquiry = async (payload: Record<string, any>) => {
  const newInquiry = new Inquiry(payload);
  return await newInquiry.save();
};

export const getInquiries = async (query: any) => {
  const filter: any = {};

  if (query.status) filter.status = query.status;
  if (query.agent) filter.agent = query.agent;
  if (query.listing) filter.listing = query.listing;

  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(query.limit || 10)));
  const skip = (page - 1) * limit;

  const [inquiries, total] = await Promise.all([
    Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("listing", "title slug media.cover.url")
      .populate("agent", "name email phone photoUrl")
      .lean()
      .exec(),
    Inquiry.countDocuments(filter).exec(),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    inquiries,
  };
};

export const getInquiryById = async (id: string) => {
  const inquiry = await Inquiry.findById(id)
    .populate("listing", "title slug")
    .populate("agent", "name email phone photoUrl")
    .lean()
    .exec();

  if (!inquiry) throw new AppError("Inquiry not found", 404);
  return inquiry;
};

export const updateInquiryStatus = async (id: string, status: string) => {
  const validStatuses = ["pending", "contacted", "resolved", "archived"];
  if (!validStatuses.includes(status)) {
    throw new AppError("Invalid status", 400);
  }

  const updated = await Inquiry.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true }
  ).lean().exec();

  if (!updated) throw new AppError("Inquiry not found", 404);
  return updated;
};

export const deleteInquiry = async (id: string) => {
  const deleted = await Inquiry.findByIdAndDelete(id).exec();
  if (!deleted) throw new AppError("Inquiry not found", 404);
  return deleted;
};