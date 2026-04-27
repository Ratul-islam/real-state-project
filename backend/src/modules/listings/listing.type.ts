import { Types } from "mongoose";
import { IAgent } from "../agents/agents.types";

export type VideoProvider =
  | "youtube"
  | "facebook"
  | "vimeo"
  | "tiktok"
  | "custom";

export type ListingAssetType = "image" | "pdf";

export type Pricing =
  | {
      amount: number;
      currency?: string;
      min?: never;
      max?: never;
    }
  | {
      min: number;
      max: number;
      currency?: string;
      amount?: never;
    };

export interface IListingAsset {
  type: ListingAssetType;   
  url: string;
  alt?: string;             
  pages?: number;           
  order?: number;
}

export interface IListingImage {
  url: string;
  alt?: string;
  order?: number;
}

export interface IListingVideo {
  provider: VideoProvider;
  url: string;
  embedId?: string;
}

export interface IListingMedia {
  cover: IListingImage;
  gallery: IListingImage[];
  video?: IListingVideo;
  virtualTourUrl?: string;
}

export interface IListingFloorPlan {
  title: string;
  sizeSqft: number;
  bedrooms: number;
  bathrooms: number;

  pricing: Pricing;

  image: IListingAsset;

  description?: string;
  order?: number;
}

export interface IListing {
  title: string;
  description: string;
  media: IListingMedia;
  slug: String;

  zip: string;
  city: string;
  locationText: string;
  thana: string;
  neighborhood: string;

  beds: number;
  baths: number;
  sqft: number;

  propertyStatus:
    | "Pending"
    | "Active"
    | "Sold"
    | "Rented"
    | "Draft"
    | "Archived";

  pricing: Pricing;

  lotSize: string;
  rooms: number;

  forRent: boolean;
  featured: boolean;

  customId: string;

  garages: number;
  garageSize: string;

  availableFrom: Date;

  basement: string;
  extraDetails: string;
  roofing: string;
  exteriorMaterial: string;
  ownerNotes: string;

  businessType:
    | "housing society"
    | "housing construction"
    | "home solution";

  propertyType:
    | "Houses"
    | "Apartments"
    | "Villa"
    | "Office"
    | "Land Sharing";

  yearBuilding: number;

  tags: string[];
  features: string[];

  floorPlans: IListingFloorPlan[];

  geo: {
    type: "Point";
    coordinates: [number, number];
  };
  
  agent?: Types.ObjectId | string | IAgent;

  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateListingInput = {
  title: string;

  description?: string;

  media: {
    cover: { url: string; alt?: string; order?: number };
    gallery?: { url: string; alt?: string; order?: number }[];
    video?: {
      provider: VideoProvider;
      url: string;
      embedId?: string;
    } | null;
    virtualTourUrl?: string;
  };

  city: string;
  locationText: string;

  zip?: string;
  thana?: string;
  neighborhood?: string;

  beds: number;
  baths: number;
  sqft: number;

  pricing: Pricing;

  forRent: boolean;
  featured?: boolean;

  businessType:
    | "housing society"
    | "housing construction"
    | "home solution";

  propertyType:
    | "Houses"
    | "Apartments"
    | "Villa"
    | "Office"
    | "Land Sharing";

  yearBuilding: number;

  propertyStatus?:
    | "Pending"
    | "Active"
    | "Sold"
    | "Rented"
    | "Draft"
    | "Archived";

  tags?: string[];
  features?: string[];

  floorPlans?: IListingFloorPlan[];

  lotSize?: string;
  rooms?: number;
  customId?: string;
  garages?: number;
  garageSize?: string;
  availableFrom?: string | Date;
  basement?: string;
  extraDetails?: string;
  roofing?: string;
  exteriorMaterial?: string;
  ownerNotes?: string;

  lat: number;
  lng: number;

  agent?: string;
};

export type ListingsQuery = {
  city?: string;

  forRent?: string;
  featured?: string;

  propertyType?:
    | "Houses"
    | "Apartments"
    | "Villa"
    | "Office"
    | "Land Sharing";

  businessType?:
    | "housing society"
    | "housing construction"
    | "home solution";

  search?: string;
  q?: string;

  propertyId?: string;

  minPrice?: string;
  maxPrice?: string;

  minBeds?: string;
  minBaths?: string;

  minSqft?: string;
  maxSqft?: string;

  tags?: string;
  features?: string;

  hasVideo?: string;
  hasVirtualTour?: string;

  page?: string;
  limit?: string;

  sort?: "price" | "sqft" | "yearBuilding" | "createdAt";
  order?: "asc" | "desc";

  agent?: string;
};