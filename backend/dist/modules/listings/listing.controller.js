"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListingBySlug = exports.getListingByTitle = exports.getListingById = exports.getAllListings = exports.addListing = void 0;
exports.updateListing = updateListing;
exports.deleteListing = deleteListing;
const listing_services_js_1 = require("./listing.services.js");
const responses_js_1 = require("../../utils/responses.js");
const AppError_js_1 = require("../../utils/AppError.js");
const listings_js_1 = require("../../utils/listings.js");
const addListing = async (request, reply) => {
    const data = request.body;
    try {
        if (!data?.media?.cover?.url) {
            return (0, responses_js_1.sendError)(reply, {
                message: "media.cover.url is required",
                statusCode: 400,
            });
        }
        const exists = await (0, listing_services_js_1.getListingByTitleService)(data.title);
        if (exists) {
            return (0, responses_js_1.sendError)(reply, { message: "Property with that title already exists", statusCode: 409 });
        }
        const normalized = (0, listings_js_1.normalizeListingPayload)(data);
        if (!normalized.pricing) {
            return (0, responses_js_1.sendError)(reply, {
                message: "pricing is required (amount OR min+max)",
                statusCode: 400,
            });
        }
        const created = await (0, listing_services_js_1.createNewListing)(normalized);
        return (0, responses_js_1.sendSuccess)(reply, {
            message: "Listing successfully added",
            statusCode: 201,
            data: created,
        });
    }
    catch (err) {
        request.log.error({ err }, "Error adding listing");
        return (0, responses_js_1.sendError)(reply, {
            message: "Error adding listing",
            statusCode: 500,
        });
    }
};
exports.addListing = addListing;
const getAllListings = async (request, reply) => {
    try {
        const data = await (0, listing_services_js_1.listListings)(request.query);
        console.log(data);
        return (0, responses_js_1.sendSuccess)(reply, { data });
    }
    catch (err) {
        request.log.error({ err }, "Failed to fetch listings");
        return (0, responses_js_1.sendError)(reply, {
            statusCode: 500,
            message: "Failed to fetch listings",
        });
    }
};
exports.getAllListings = getAllListings;
const getListingById = async (request, reply) => {
    try {
        const { id } = request.params;
        if (!id) {
            return (0, responses_js_1.sendError)(reply, {
                statusCode: 400,
                message: "Listing id is required",
            });
        }
        const listing = await (0, listing_services_js_1.getListingById)(id);
        if (!listing) {
            return (0, responses_js_1.sendError)(reply, {
                statusCode: 404,
                message: "Listing not found",
            });
        }
        return (0, responses_js_1.sendSuccess)(reply, { data: listing });
    }
    catch (err) {
        request.log.error({ err }, "Failed to fetch listing by id");
        return (0, responses_js_1.sendError)(reply, {
            statusCode: 500,
            message: "Failed to fetch listing",
        });
    }
};
exports.getListingById = getListingById;
const getListingByTitle = async (request, reply) => {
    try {
        const { title } = request.params;
        const decodedTitle = typeof title === "string" ? decodeURIComponent(title).trim() : "";
        if (!decodedTitle) {
            return (0, responses_js_1.sendError)(reply, {
                statusCode: 400,
                message: "Listing title is required",
            });
        }
        const listing = await (0, listing_services_js_1.getListingByTitleService)(decodedTitle);
        if (!listing) {
            return (0, responses_js_1.sendError)(reply, {
                statusCode: 404,
                message: "Listing not found",
            });
        }
        return (0, responses_js_1.sendSuccess)(reply, { data: listing });
    }
    catch (err) {
        request.log.error({ err }, "Failed to fetch listing by title");
        return (0, responses_js_1.sendError)(reply, {
            statusCode: 500,
            message: "Failed to fetch listing",
        });
    }
};
exports.getListingByTitle = getListingByTitle;
const getListingBySlug = async (request, reply) => {
    try {
        const { slug } = request.params;
        if (!slug) {
            return (0, responses_js_1.sendError)(reply, {
                statusCode: 400,
                message: "Listing slug is required",
            });
        }
        const listing = await (0, listing_services_js_1.getListingBySlugService)(slug);
        if (!listing) {
            return (0, responses_js_1.sendError)(reply, {
                statusCode: 404,
                message: "Listing not found",
            });
        }
        return (0, responses_js_1.sendSuccess)(reply, { data: listing });
    }
    catch (err) {
        request.log.error({ err }, "Failed to fetch listing by slug");
        return (0, responses_js_1.sendError)(reply, {
            statusCode: 500,
            message: "Failed to fetch listing",
        });
    }
};
exports.getListingBySlug = getListingBySlug;
async function updateListing(request, reply) {
    try {
        const { id } = request.params;
        const payload = request.body;
        const normalized = (0, listings_js_1.normalizeListingPayload)(payload);
        if (!normalized?.pricing) {
            return (0, responses_js_1.sendError)(reply, {
                statusCode: 400,
                message: "pricing is required (amount OR min+max)",
            });
        }
        const updated = await (0, listing_services_js_1.updateListingById)(id, normalized);
        return (0, responses_js_1.sendSuccess)(reply, {
            statusCode: 200,
            message: "Listing updated",
            data: updated,
        });
    }
    catch (err) {
        request.log.error(err);
        if (err instanceof AppError_js_1.AppError) {
            return (0, responses_js_1.sendError)(reply, {
                statusCode: err.statusCode,
                message: err.message,
            });
        }
        return (0, responses_js_1.sendError)(reply, {
            statusCode: 500,
            message: "Failed to update listing",
        });
    }
}
async function deleteListing(request, reply) {
    try {
        const { id } = request.params;
        const result = await (0, listing_services_js_1.deleteListingById)(id);
        return (0, responses_js_1.sendSuccess)(reply, {
            statusCode: 200,
            message: "Listing deleted",
            data: result,
        });
    }
    catch (err) {
        request.log.error(err);
        if (err instanceof AppError_js_1.AppError) {
            return (0, responses_js_1.sendError)(reply, {
                statusCode: err.statusCode,
                message: err.message,
            });
        }
        return (0, responses_js_1.sendError)(reply, {
            statusCode: 500,
            message: "Failed to delete listing",
        });
    }
}
