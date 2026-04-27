"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = listingRoutes;
const listing_controller_js_1 = require("./listing.controller.js");
const pricingBodySchema = {
    anyOf: [
        {
            type: "object",
            required: ["amount"],
            properties: {
                amount: { type: "number", minimum: 0 },
                currency: { type: "string" },
            },
            additionalProperties: false,
        },
        {
            type: "object",
            required: ["min", "max"],
            properties: {
                min: { type: "number", minimum: 0 },
                max: { type: "number", minimum: 0 },
                currency: { type: "string" },
            },
            additionalProperties: false,
        },
    ],
};
const listingAssetSchemaBody = {
    type: "object",
    required: ["type", "url"],
    properties: {
        type: { type: "string", enum: ["image", "pdf"] },
        url: { type: "string", minLength: 1 },
        alt: { type: "string" },
        pages: { type: "number", minimum: 1 },
        order: { type: "number" },
    },
    additionalProperties: false,
};
async function listingRoutes(app) {
    app.post("/add", {
        preHandler: [app.verifyAccess],
        schema: {
            body: {
                type: "object",
                required: [
                    "title",
                    "media",
                    "city",
                    "locationText",
                    "beds",
                    "baths",
                    "sqft",
                    "pricing",
                    "forRent",
                    "propertyType",
                    "yearBuilding",
                    "lat",
                    "lng",
                    "businessType",
                ],
                properties: {
                    title: { type: "string", minLength: 2 },
                    description: { type: "string", default: "" },
                    agent: { type: "string" },
                    media: {
                        type: "object",
                        required: ["cover"],
                        properties: {
                            cover: {
                                type: "object",
                                required: ["url"],
                                properties: {
                                    url: { type: "string", minLength: 1 },
                                    alt: { type: "string", default: "" },
                                    order: { type: "number", default: 0 },
                                },
                                additionalProperties: false,
                            },
                            gallery: {
                                type: "array",
                                default: [],
                                items: {
                                    type: "object",
                                    required: ["url"],
                                    properties: {
                                        url: { type: "string", minLength: 1 },
                                        alt: { type: "string", default: "" },
                                        order: { type: "number", default: 0 },
                                    },
                                    additionalProperties: false,
                                },
                            },
                            video: {
                                anyOf: [
                                    { type: "null" },
                                    {
                                        type: "object",
                                        required: ["provider", "url"],
                                        properties: {
                                            provider: {
                                                type: "string",
                                                enum: ["youtube", "facebook", "vimeo", "tiktok", "custom"],
                                            },
                                            url: { type: "string", minLength: 5 },
                                            embedId: { type: "string" },
                                        },
                                        additionalProperties: false,
                                    },
                                ],
                                default: null,
                            },
                            virtualTourUrl: { type: "string", default: "" },
                        },
                        additionalProperties: false,
                    },
                    city: { type: "string", minLength: 1 },
                    locationText: { type: "string", minLength: 1 },
                    zip: { type: "string", default: "" },
                    thana: { type: "string", default: "" },
                    neighborhood: { type: "string", default: "" },
                    beds: { type: "number", minimum: 0 },
                    baths: { type: "number", minimum: 0 },
                    sqft: { type: "number", minimum: 0 },
                    pricing: pricingBodySchema,
                    forRent: { type: "boolean" },
                    featured: { type: "boolean", default: false },
                    businessType: {
                        type: "string",
                        enum: ["housing society", "housing construction", "home solution"],
                    },
                    propertyType: {
                        type: "string",
                        enum: ["Houses", "Apartments", "Villa", "Office", "Land Sharing"],
                    },
                    yearBuilding: { type: "number" },
                    propertyStatus: {
                        type: "string",
                        enum: ["Pending", "Active", "Sold", "Rented", "Draft", "Archived"],
                        default: "Pending",
                    },
                    tags: { type: "array", items: { type: "string" }, default: [] },
                    features: { type: "array", items: { type: "string" }, default: [] },
                    floorPlans: {
                        type: "array",
                        default: [],
                        items: {
                            type: "object",
                            required: [
                                "title",
                                "sizeSqft",
                                "bedrooms",
                                "bathrooms",
                                "pricing",
                                "image",
                            ],
                            properties: {
                                title: { type: "string", minLength: 1 },
                                sizeSqft: { type: "number", minimum: 0 },
                                bedrooms: { type: "number", minimum: 0 },
                                bathrooms: { type: "number", minimum: 0 },
                                pricing: pricingBodySchema,
                                image: listingAssetSchemaBody,
                                description: { type: "string", default: "" },
                                order: { type: "number", default: 0 },
                            },
                            additionalProperties: false,
                        },
                    },
                    lotSize: { type: "string", default: "" },
                    rooms: { type: "number", minimum: 0, default: 0 },
                    customId: { type: "string", default: "" },
                    garages: { type: "number", minimum: 0, default: 0 },
                    garageSize: { type: "string", default: "" },
                    availableFrom: { type: "string", format: "date", nullable: true },
                    basement: { type: "string", default: "" },
                    extraDetails: { type: "string", default: "" },
                    roofing: { type: "string", default: "" },
                    exteriorMaterial: { type: "string", default: "" },
                    ownerNotes: { type: "string", default: "" },
                    lat: { type: "number" },
                    lng: { type: "number" },
                },
                additionalProperties: false,
            },
        },
    }, listing_controller_js_1.addListing);
    app.put("/:id", {
        preHandler: [app.verifyAccess],
        schema: {
            params: {
                type: "object",
                required: ["id"],
                properties: {
                    id: { type: "string", minLength: 10 },
                },
            },
            body: {
                type: "object",
                required: [
                    "title",
                    "media",
                    "city",
                    "locationText",
                    "beds",
                    "baths",
                    "sqft",
                    "pricing",
                    "forRent",
                    "propertyType",
                    "yearBuilding",
                    "lat",
                    "lng",
                    "businessType",
                ],
                properties: {
                    title: { type: "string", minLength: 2 },
                    description: { type: "string", default: "" },
                    agent: { type: "string" },
                    media: {
                        type: "object",
                        required: ["cover"],
                        properties: {
                            cover: {
                                type: "object",
                                required: ["url"],
                                properties: {
                                    url: { type: "string", minLength: 1 },
                                    alt: { type: "string", default: "" },
                                    order: { type: "number", default: 0 },
                                },
                                additionalProperties: false,
                            },
                            gallery: {
                                type: "array",
                                default: [],
                                items: {
                                    type: "object",
                                    required: ["url"],
                                    properties: {
                                        url: { type: "string", minLength: 1 },
                                        alt: { type: "string", default: "" },
                                        order: { type: "number", default: 0 },
                                    },
                                    additionalProperties: false,
                                },
                            },
                            video: {
                                anyOf: [
                                    { type: "null" },
                                    {
                                        type: "object",
                                        required: ["provider", "url"],
                                        properties: {
                                            provider: {
                                                type: "string",
                                                enum: ["youtube", "facebook", "vimeo", "tiktok", "custom"],
                                            },
                                            url: { type: "string", minLength: 5 },
                                            embedId: { type: "string" },
                                        },
                                        additionalProperties: false,
                                    },
                                ],
                                default: null,
                            },
                            virtualTourUrl: { type: "string", default: "" },
                        },
                        additionalProperties: false,
                    },
                    city: { type: "string", minLength: 1 },
                    locationText: { type: "string", minLength: 1 },
                    zip: { type: "string", default: "" },
                    thana: { type: "string", default: "" },
                    neighborhood: { type: "string", default: "" },
                    beds: { type: "number", minimum: 0 },
                    baths: { type: "number", minimum: 0 },
                    sqft: { type: "number", minimum: 0 },
                    pricing: pricingBodySchema,
                    forRent: { type: "boolean" },
                    featured: { type: "boolean", default: false },
                    businessType: {
                        type: "string",
                        enum: ["housing society", "housing construction", "home solution"],
                    },
                    propertyType: {
                        type: "string",
                        enum: ["Houses", "Apartments", "Villa", "Office", "Land Sharing"],
                    },
                    yearBuilding: { type: "number" },
                    propertyStatus: {
                        type: "string",
                        enum: ["Pending", "Active", "Sold", "Rented", "Draft", "Archived"],
                        default: "Pending",
                    },
                    tags: { type: "array", items: { type: "string" }, default: [] },
                    features: { type: "array", items: { type: "string" }, default: [] },
                    floorPlans: {
                        type: "array",
                        default: [],
                        items: {
                            type: "object",
                            required: [
                                "title",
                                "sizeSqft",
                                "bedrooms",
                                "bathrooms",
                                "pricing",
                                "image",
                            ],
                            properties: {
                                title: { type: "string", minLength: 1 },
                                sizeSqft: { type: "number", minimum: 0 },
                                bedrooms: { type: "number", minimum: 0 },
                                bathrooms: { type: "number", minimum: 0 },
                                pricing: pricingBodySchema,
                                image: {
                                    type: "object",
                                    required: ["url"],
                                    properties: {
                                        url: { type: "string", minLength: 1 },
                                        alt: { type: "string", default: "" },
                                        order: { type: "number", default: 0 },
                                    },
                                    additionalProperties: false,
                                },
                                description: { type: "string", default: "" },
                                order: { type: "number", default: 0 },
                            },
                            additionalProperties: false,
                        },
                    },
                    lotSize: { type: "string", default: "" },
                    rooms: { type: "number", minimum: 0, default: 0 },
                    customId: { type: "string", default: "" },
                    garages: { type: "number", minimum: 0, default: 0 },
                    garageSize: { type: "string", default: "" },
                    availableFrom: { type: "string", format: "date", nullable: true },
                    basement: { type: "string", default: "" },
                    extraDetails: { type: "string", default: "" },
                    roofing: { type: "string", default: "" },
                    exteriorMaterial: { type: "string", default: "" },
                    ownerNotes: { type: "string", default: "" },
                    lat: { type: "number" },
                    lng: { type: "number" },
                },
                additionalProperties: false,
            },
        },
    }, listing_controller_js_1.updateListing);
    app.get("/", listing_controller_js_1.getAllListings);
    app.get("/:id", listing_controller_js_1.getListingById);
    app.get("/title/:title", listing_controller_js_1.getListingByTitle);
    app.get("/slug/:slug", listing_controller_js_1.getListingBySlug);
    app.delete("/:id", { preHandler: [app.verifyAccess] }, listing_controller_js_1.deleteListing);
}
