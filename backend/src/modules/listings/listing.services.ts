import mongoose from "mongoose";
import { AppError } from "../../utils/AppError.js";
import { Listing } from "./listing.model.js";
import { CreateListingInput, ListingsQuery } from "./listing.type.js";


function buildMedia(input: any) {
  if (!input?.media?.cover?.url) {
    throw new Error("media.cover.url is required");
  }

  const cover = {
    url: input.media.cover.url,
    alt: input.media.cover.alt ?? "",
    order: input.media.cover.order ?? 0,
  };

  const gallery = (input.media.gallery ?? []).map((img: any, idx: number) => ({
    url: img.url,
    alt: img.alt ?? "",
    order: img.order ?? idx + 1,
  }));

  const video =
    input.media.video?.url && input.media.video?.provider
      ? {
          provider: input.media.video.provider,
          url: input.media.video.url,
          embedId: input.media.video.embedId ?? "",
        }
      : undefined;

  const virtualTourUrl = input.media.virtualTourUrl ?? "";

  return {
    cover,
    gallery,
    ...(video ? { video } : {}),
    ...(virtualTourUrl ? { virtualTourUrl } : {}),
  };
}

function slugify(name:string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}


function buildFloorPlans(input: any) {
  const plans = Array.isArray(input?.floorPlans) ? input.floorPlans : [];

  return plans
    .map((p: any, idx: number) => {

      let pricing: any = undefined;

      if (p?.pricing && typeof p.pricing === "object") {
        const pr = { ...p.pricing };

        if (pr.amount !== undefined) pr.amount = Number(pr.amount);
        if (pr.min !== undefined) pr.min = Number(pr.min);
        if (pr.max !== undefined) pr.max = Number(pr.max);

        if (!pr.currency) pr.currency = "BDT";

        pricing = pr;
      } else if (p?.price !== undefined) {
        const amount = Number(p.price);
        if (Number.isFinite(amount)) {
          pricing = {
            amount,
            currency: p.currency ?? "BDT",
          };
        }
      }

      let asset: any = undefined;

      if (p?.image?.url) {
        asset = {
          type:
            p.image.type === "pdf" || p.image.type === "image"
              ? p.image.type
              : "image", 
          url: String(p.image.url),
          alt: p.image.alt ?? "",
          order:
            Number.isFinite(Number(p.image.order))
              ? Number(p.image.order)
              : 0,
        };

        if (p.image.pages !== undefined) {
          const pages = Number(p.image.pages);
          if (Number.isFinite(pages) && pages >= 1) {
            asset.pages = pages;
          }
        }
      }

      return {
        title: String(p.title ?? "").trim(),
        sizeSqft: Number(p.sizeSqft ?? 0),
        bedrooms: Number(p.bedrooms ?? 0),
        bathrooms: Number(p.bathrooms ?? 0),

        pricing,

        image: asset,

        description: p.description ?? "",
        order:
          Number.isFinite(Number(p.order)) ? Number(p.order) : idx,
      };
    })
    .filter(
      (p: any) =>
        p.title &&
        p.image?.url &&
        p.pricing 
    );
}
export const createNewListing = async (input: CreateListingInput) => {
  const media = buildMedia(input);
  const floorPlans = buildFloorPlans(input);

  console.log(input)

  const availableFrom =
    input.availableFrom == null || input.availableFrom === ""
      ? undefined
      : input.availableFrom instanceof Date
      ? input.availableFrom
      : new Date(String(input.availableFrom));

  const safeAvailableFrom =
    availableFrom && Number.isNaN(availableFrom.getTime())
      ? undefined
      : availableFrom;

  const pricing = input.pricing
    ? { ...input.pricing, currency: input.pricing.currency ?? "BDT" }
    : undefined;

  const doc = await Listing.create({
    title: input.title,
    description: input.description ?? "",
    slug : slugify(input.title),
    media,

    city: input.city,
    locationText: input.locationText,

    zip: input.zip ?? "",
    thana: input.thana ?? "",
    neighborhood: input.neighborhood ?? "",

    beds: input.beds,
    baths: input.baths,
    sqft: input.sqft,

    pricing,

    forRent: input.forRent,
    featured: input.featured ?? false,
    businessType: input.businessType,
    propertyType: input.propertyType,
    yearBuilding: input.yearBuilding,

    propertyStatus: input.propertyStatus ?? "Pending",

    tags: input.tags ?? [],
    features: input.features ?? [],

    floorPlans,

    lotSize: input.lotSize ?? "",
    rooms: input.rooms ?? 0,

    customId: input.customId?.trim() ? input.customId.trim() : undefined,

    garages: input.garages ?? 0,
    garageSize: input.garageSize ?? "",

    availableFrom: safeAvailableFrom,

    basement: input.basement ?? "",
    extraDetails: input.extraDetails ?? "",
    roofing: input.roofing ?? "",
    exteriorMaterial: input.exteriorMaterial ?? "",
    ownerNotes: input.ownerNotes ?? "",
    agent:input.agent??"",
    geo: { type: "Point", coordinates: [input.lng, input.lat] },
  });

  return doc;
};


const DEFAULT_CURRENCY = "BDT";

const escapeRx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function normalizePriceRange(q: any) {
  const min = q?.minPrice != null && q.minPrice !== "" ? Number(q.minPrice) : undefined;
  const max = q?.maxPrice != null && q.maxPrice !== "" ? Number(q.maxPrice) : undefined;

  const minOk = Number.isFinite(min as any);
  const maxOk = Number.isFinite(max as any);

  return {
    min: minOk ? (min as number) : undefined,
    max: maxOk ? (max as number) : undefined,
  };
}

function buildPricingFilter(min?: number, max?: number) {
  const ors: any[] = [];

  if (min != null && max != null) {
    ors.push({ "pricing.amount": { $gte: min, $lte: max } });
    ors.push({
      $and: [
        { "pricing.min": { $lte: max } },
        { "pricing.max": { $gte: min } },
      ],
    });
  } else if (min != null) {
    ors.push({ "pricing.amount": { $gte: min } });
    ors.push({ "pricing.max": { $gte: min } }); 
  } else if (max != null) {
    ors.push({ "pricing.amount": { $lte: max } });
    ors.push({ "pricing.min": { $lte: max } }); 
  }

  return ors.length ? { $or: ors } : null;
}

export async function listListings(
  q: ListingsQuery & {
    businessType?: string;
    search?: string;
    q?: string;
    propertyId?: string;
    hasVirtualTour?: string;
  },
) {
  const filter: any = {};

  if (q.city) filter.city = q.city;

  if (q.forRent !== undefined) filter.forRent = String(q.forRent) === "true";
  if (q.featured !== undefined) filter.featured = String(q.featured) === "true";

  if (q.propertyType) filter.propertyType = q.propertyType;
  if (q.businessType) filter.businessType = q.businessType;

  if (q.propertyId) filter._id = q.propertyId;

  const { min, max } = normalizePriceRange(q);
  const pricingClause = buildPricingFilter(min, max);
  if (pricingClause) {
    filter.$and = Array.isArray(filter.$and) ? filter.$and : [];
    filter.$and.push(pricingClause);
  }

  if (q.minBeds !== undefined) filter.beds = { $gte: Number(q.minBeds) };
  if (q.minBaths !== undefined) filter.baths = { $gte: Number(q.minBaths) };

  if (q.minSqft || q.maxSqft) {
    const minSqft =
      q.minSqft != null && q.minSqft !== "" ? Number(q.minSqft) : undefined;
    const maxSqft =
      q.maxSqft != null && q.maxSqft !== "" ? Number(q.maxSqft) : undefined;

    filter.sqft = {};
    if (Number.isFinite(minSqft as any)) filter.sqft.$gte = minSqft;
    if (Number.isFinite(maxSqft as any)) filter.sqft.$lte = maxSqft;

    // cleanup if empty
    if (!Object.keys(filter.sqft).length) delete filter.sqft;
  }

  if (q.tags) {
    const tags = String(q.tags)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (tags.length) filter.tags = { $all: tags };
  }

  if (q.features) {
    const features = String(q.features)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (features.length) filter.features = { $all: features };
  }

  if (q.hasVideo !== undefined) {
    if (String(q.hasVideo) === "true")
      filter["media.video.url"] = { $exists: true, $ne: "" };
    if (String(q.hasVideo) === "false")
      filter["media.video.url"] = { $in: ["", null] };
  }

  if (q.hasVirtualTour !== undefined) {
    if (String(q.hasVirtualTour) === "true") {
      filter["media.virtualTourUrl"] = { $exists: true, $ne: "" };
    }
    if (String(q.hasVirtualTour) === "false") {
      filter["media.virtualTourUrl"] = { $in: ["", null] };
    }
  }

  const searchText = String(q.search || q.q || "").trim();
  if (searchText) {
    const rx = new RegExp(escapeRx(searchText), "i");

    // Keep any existing $and clauses (eg pricingClause). Put search in $and too.
    const searchOr = {
      $or: [
        { title: rx },
        { city: rx },
        { locationText: rx },
        { propertyType: rx },
        { businessType: rx },
        { tags: rx },
        { features: rx },
      ],
    };

    filter.$and = Array.isArray(filter.$and) ? filter.$and : [];
    filter.$and.push(searchOr);
  }

  const page = Math.max(1, Number(q.page ?? 1));
  const limit = Math.min(50, Math.max(1, Number(q.limit ?? 12)));
  const skip = (page - 1) * limit;

  const allowedSort = ["price", "sqft", "yearBuilding", "createdAt"];
  const sortFieldRaw = allowedSort.includes(String(q.sort))
    ? String(q.sort)
    : "createdAt";

  const sortField =
    sortFieldRaw === "price" ? "pricing.amount" : sortFieldRaw;

  const sortOrder = String(q.order) === "asc" ? 1 : -1;

  const [items, total] = await Promise.all([
    Listing.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Listing.countDocuments(filter).exec(),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items,
  };
}


export const getListingById = async (id: string) => {
  const item = await Listing.findById(id).lean().exec();
  return item;
};

export async function getListingByTitleService(title: string) {
   const gg=Listing.findOne({ 
      title: { $regex: `^${escapeRegex(title)}$`, $options: "i" } 
    })
    .populate("agent")
    .lean()
    .exec();
    return gg;
}
export async function getListingBySlugService(slug: string) {
  return Listing.findOne({ slug }).populate("agent")
    .lean()
    .exec();
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function updateListingById(
  id: string,
  payload: Record<string, any>
) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid listing id", 400);
  }

  const $set: Record<string, any> = { ...payload };

  delete $set.price;
  delete $set.currency;

  if ("agent" in payload) {
    if (payload.agent === null || payload.agent === "" || payload.agent === "null") {
      $set.agent = undefined; 
    } else {
      if (!mongoose.isValidObjectId(payload.agent)) {
        throw new AppError("Invalid agent id", 400);
      }
      $set.agent = payload.agent;
    }
  }

  if (payload.lat !== undefined || payload.lng !== undefined) {
    if (payload.lat === undefined || payload.lng === undefined) {
      throw new AppError("Both lat and lng are required together", 400);
    }

    const lat = Number(payload.lat);
    const lng = Number(payload.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new AppError("lat/lng must be valid numbers", 400);
    }

    $set.geo = { type: "Point", coordinates: [lng, lat] };
    delete $set.lat;
    delete $set.lng;
  }

  if ("availableFrom" in payload) {
    if (payload.availableFrom === null || payload.availableFrom === "") {
      $set.availableFrom = undefined;
    } else {
      const parsed =
        payload.availableFrom instanceof Date
          ? payload.availableFrom
          : new Date(String(payload.availableFrom));

      if (Number.isNaN(parsed.getTime())) {
        throw new AppError("Invalid availableFrom date", 400);
      }

      $set.availableFrom = parsed;
    }
  }

  if ("customId" in payload) {
    $set.customId =
      typeof payload.customId === "string" && payload.customId.trim()
        ? payload.customId.trim()
        : undefined;
  }

  if ($set.media) {
    const existing = await Listing.findById(id).select("media").lean().exec();

    if (!existing) {
      throw new AppError("Listing not found", 404);
    }

    const mergedMediaInput = {
      media: {
        cover: $set.media.cover ?? (existing as any).media?.cover,
        gallery: $set.media.gallery ?? (existing as any).media?.gallery ?? [],
        video:
          $set.media.video !== undefined
            ? $set.media.video
            : (existing as any).media?.video,
        virtualTourUrl:
          $set.media.virtualTourUrl !== undefined
            ? $set.media.virtualTourUrl
            : (existing as any).media?.virtualTourUrl ?? "",
      },
    };

    $set.media = buildMedia(mergedMediaInput);
  }

  if (payload.title) {
    $set.slug = slugify(payload.title);
  }

  if ($set.pricing && typeof $set.pricing === "object") {
    $set.pricing = {
      ...$set.pricing,
      currency: $set.pricing.currency ?? "BDT",
    };
  }

  if ($set.floorPlans !== undefined) {
    $set.floorPlans = buildFloorPlans({ floorPlans: payload.floorPlans });
  }

  const updated = await Listing.findByIdAndUpdate(
    id,
    { $set },
    { new: true, runValidators: true }
  ).populate("agent");

  if (!updated) {
    throw new AppError("Listing not found", 404);
  }

  return updated;
}

export async function deleteListingById(id: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid listing id", 400);
  }

  const deleted = await Listing.findByIdAndDelete(id);

  if (!deleted) {
    throw new AppError("Listing not found", 404);
  }

  return { id };
}
