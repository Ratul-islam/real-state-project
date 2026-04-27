import mongoose from "mongoose";
import { IAgent } from "./agents.types.js";

const agentSchema = new mongoose.Schema<IAgent>(
  {
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
  },
  { timestamps: true }
);

export const Agent = 
  mongoose.models.Agent || mongoose.model<IAgent>("Agent", agentSchema);