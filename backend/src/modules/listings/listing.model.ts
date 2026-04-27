import mongoose from "mongoose";
import { IListing } from "./listing.type";

const listingImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const listingVideoSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["youtube", "facebook", "vimeo", "tiktok", "custom"],
      required: true,
    },
    url: { type: String, required: true, trim: true },
    embedId: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const listingMediaSchema = new mongoose.Schema(
  {
    cover: { type: listingImageSchema, required: true },
    gallery: { type: [listingImageSchema], default: [] },
    video: { type: listingVideoSchema, required: false, default: undefined },
    virtualTourUrl: { type: String, default: "" },
  },
  { _id: false }
);

const pricingSchema = new mongoose.Schema(
  {
    amount: { type: Number, min: 0 },
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
    currency: { type: String, default: "BDT" },
  },
  { _id: false }
);

pricingSchema.pre("validate", function () {
  const p = this as {
    amount?: number;
    min?: number;
    max?: number;
  };

  const hasAmount = typeof p.amount === "number";
  const hasMin = typeof p.min === "number";
  const hasMax = typeof p.max === "number";

  if (hasAmount && (hasMin || hasMax)) {
    (this as any).invalidate(
      "amount",
      "Provide either amount OR (min and max), not both."
    );
    return;
  }

  if (!hasAmount && !(hasMin && hasMax)) {
    (this as any).invalidate(
      "min",
      "Provide amount OR both min and max."
    );
    return;
  }

  if (hasMin && hasMax && (p.min as number) > (p.max as number)) {
    (this as any).invalidate(
      "min",
      "min cannot be greater than max."
    );
  }
});

const listingAssetSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["image", "pdf"], required: true },
    url: { type: String, required: true, trim: true },
    alt: { type: String, default: "" },
    pages: { type: Number, min: 1 },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const listingFloorPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    sizeSqft: { type: Number, required: true, min: 0 },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },

    pricing: { type: pricingSchema, required: true },
    image: { type: listingAssetSchema, required: true },  

    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema<IListing>(
  {
    title: { type: String, unique: true,required: true, trim: true },
    description: { type: String, default: "" },
    slug: {type:String},
    media: { type: listingMediaSchema, required: true },
    
    city: { type: String, required: true, index: true },
    locationText: { type: String, required: true },

    zip: { type: String, trim: true, default: "" },
    thana: { type: String, trim: true, default: "" },
    neighborhood: { type: String, trim: true, default: "" },

    beds: { type: Number, required: true, min: 0, index: true },
    baths: { type: Number, required: true, min: 0, index: true },
    sqft: { type: Number, required: true, min: 0, index: true },

    pricing: { type: pricingSchema, required: true },

    forRent: { type: Boolean, required: true, index: true },
    featured: { type: Boolean, default: false, index: true },

    businessType: {
      type: String,
      enum: ["housing society", "housing construction", "home solution"],
      required: true,
      index: true,
    },

    propertyType: {
      type: String,
      enum: ["Houses", "Apartments", "Villa", "Office", "Land Sharing"],
      required: true,
      index: true,
    },

    yearBuilding: { type: Number, required: true, index: true },

    propertyStatus: {
      type: String,
      enum: ["Pending", "Active", "Sold", "Rented", "Draft", "Archived"],
      default: "Pending",
      index: true,
    },

    tags: { type: [String], default: [] },
    features: { type: [String], default: [] },

    floorPlans: { type: [listingFloorPlanSchema], default: [] },

    lotSize: { type: String, trim: true, default: "" },
    rooms: { type: Number, min: 0, default: 0 },

    customId: {
      type: String,
      trim: true,
      index: true,
      unique: true,
      sparse: true,
      default: undefined,
    },

    garages: { type: Number, min: 0, default: 0 },
    garageSize: { type: String, trim: true, default: "" },

    availableFrom: { type: Date, required: false },

    basement: { type: String, trim: true, default: "" },
    extraDetails: { type: String, trim: true, default: "" },
    roofing: { type: String, trim: true, default: "" },
    exteriorMaterial: { type: String, trim: true, default: "" },
    ownerNotes: { type: String, trim: true, default: "" },

    geo: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true },
    },

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: false,
      index: true,
    },
  },
  { timestamps: true }
);


listingSchema.index({ geo: "2dsphere" });
listingSchema.index({ businessType: 1 });

listingSchema.index({ "pricing.amount": 1 });
listingSchema.index({ "pricing.min": 1, "pricing.max": 1 });

listingSchema.index({
  businessType: 1,
  propertyType: 1,
  forRent: 1,
  "pricing.amount": 1,
  "pricing.min": 1,
  "pricing.max": 1,
});

export const Listing =
  mongoose.models.Listing || mongoose.model<IListing>("Listing", listingSchema);