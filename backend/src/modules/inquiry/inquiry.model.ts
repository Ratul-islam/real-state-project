import mongoose, { Document } from "mongoose";

export interface IInquiry extends Document {
  name: string;
  phone: string;
  email: string;
  message: string;
  listing?: mongoose.Types.ObjectId;
  agent?: mongoose.Types.ObjectId;
  status: "pending" | "contacted" | "resolved" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const inquirySchema = new mongoose.Schema<IInquiry>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: false,
      index: true,
    },
    
    agent: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

export const Inquiry = mongoose.models.Inquiry || mongoose.model<IInquiry>("Inquiry", inquirySchema);