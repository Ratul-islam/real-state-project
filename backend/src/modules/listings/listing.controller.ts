import { FastifyReply, FastifyRequest } from "fastify";
import {
  createNewListing,
  listListings,
  getListingById as getListingByIdService,
  updateListingById,
  deleteListingById,
  getListingByTitleService,
  getListingBySlugService,
} from "./listing.services.js";
import { sendError, sendSuccess } from "../../utils/responses.js";
import { CreateListingInput } from "./listing.type.js";
import { AppError } from "../../utils/AppError.js";
import { normalizeListingPayload } from "../../utils/listings.js";

export const addListing = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const data: CreateListingInput = request.body as any;

  try {
    if (!data?.media?.cover?.url) {
      return sendError(reply, {
        message: "media.cover.url is required",
        statusCode: 400,
      });
    }
    const exists = await getListingByTitleService(data.title);

    if (exists) {
      return sendError(reply, { message: "Property with that title already exists", statusCode: 409 });
    }

    const normalized = normalizeListingPayload(data);

    if (!normalized.pricing) {
      return sendError(reply, {
        message: "pricing is required (amount OR min+max)",
        statusCode: 400,
      });
    }

    const created = await createNewListing(normalized);

    return sendSuccess(reply, {
      message: "Listing successfully added",
      statusCode: 201,
      data: created,
    });
  } catch (err) {
    request.log.error({ err }, "Error adding listing");
    return sendError(reply, {
      message: "Error adding listing",
      statusCode: 500,
    });
  }
};

export const getAllListings = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const data = await listListings(request.query as any);
    console.log(data)
    return sendSuccess(reply, { data });
  } catch (err) {
    request.log.error({ err }, "Failed to fetch listings");
    return sendError(reply, {
      statusCode: 500,
      message: "Failed to fetch listings",
    });
  }
};

export const getListingById = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as any;

    if (!id) {
      return sendError(reply, {
        statusCode: 400,
        message: "Listing id is required",
      });
    }

    const listing = await getListingByIdService(id);

    if (!listing) {
      return sendError(reply, {
        statusCode: 404,
        message: "Listing not found",
      });
    }

    return sendSuccess(reply, { data: listing });
  } catch (err) {
    request.log.error({ err }, "Failed to fetch listing by id");
    return sendError(reply, {
      statusCode: 500,
      message: "Failed to fetch listing",
    });
  }
};

export const getListingByTitle = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { title } = request.params as any;

    const decodedTitle =
      typeof title === "string" ? decodeURIComponent(title).trim() : "";

    if (!decodedTitle) {
      return sendError(reply, {
        statusCode: 400,
        message: "Listing title is required",
      });
    }

    const listing = await getListingByTitleService(decodedTitle);

    if (!listing) {
      return sendError(reply, {
        statusCode: 404,
        message: "Listing not found",
      });
    }

    return sendSuccess(reply, { data: listing });
  } catch (err) {
    request.log.error({ err }, "Failed to fetch listing by title");
    return sendError(reply, {
      statusCode: 500,
      message: "Failed to fetch listing",
    });
  }
};

export const getListingBySlug = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { slug } = request.params as any;

    if (!slug) {
      return sendError(reply, {
        statusCode: 400,
        message: "Listing slug is required",
      });
    }

    const listing = await getListingBySlugService(slug);

    if (!listing) {
      return sendError(reply, {
        statusCode: 404,
        message: "Listing not found",
      });
    }

    return sendSuccess(reply, { data: listing });
  } catch (err) {
    request.log.error({ err }, "Failed to fetch listing by slug");
    return sendError(reply, {
      statusCode: 500,
      message: "Failed to fetch listing",
    });
  }
};

export async function updateListing(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as any;
    const payload = request.body as any;

    const normalized = normalizeListingPayload(payload);

    if (!normalized?.pricing) {
      return sendError(reply, {
        statusCode: 400,
        message: "pricing is required (amount OR min+max)",
      });
    }

    const updated = await updateListingById(id, normalized);

    return sendSuccess(reply, {
      statusCode: 200,
      message: "Listing updated",
      data: updated,
    });
  } catch (err: any) {
    request.log.error(err);

    if (err instanceof AppError) {
      return sendError(reply, {
        statusCode: err.statusCode,
        message: err.message,
      });
    }

    return sendError(reply, {
      statusCode: 500,
      message: "Failed to update listing",
    });
  }
}

export async function deleteListing(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as any;

    const result = await deleteListingById(id);

    return sendSuccess(reply, {
      statusCode: 200,
      message: "Listing deleted",
      data: result,
    });
  } catch (err: any) {
    request.log.error(err);

    if (err instanceof AppError) {
      return sendError(reply, {
        statusCode: err.statusCode,
        message: err.message,
      });
    }

    return sendError(reply, {
      statusCode: 500,
      message: "Failed to delete listing",
    });
  }
}