import { Document } from "mongoose";

export interface IAgent extends Document {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  photoUrl?: string;
  designation?: string;
  bio?: string;
  socialMedia?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}