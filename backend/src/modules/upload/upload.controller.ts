import type { FastifyReply, FastifyRequest } from "fastify";
import path from "node:path";
import { saveFileToUploads } from "./upload.services.js";
import { sendError, sendSuccess } from "../../utils/responses.js";
import { AppError } from "../../utils/AppError.js";

function toAssetType(mimetype?: string, filename?: string) {
  const mt = (mimetype || "").toLowerCase();
  const name = (filename || "").toLowerCase();

  if (mt === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (mt.startsWith("image/")) return "image";

  return null;
}

export const uploadImages = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const files = await request.saveRequestFiles({
      limits: {
        files: 20,
        fileSize: 10 * 1024 * 1024, 
      },
    });

    if (!files.length) {
      return sendError(reply, {
        statusCode: 400,
        message: "No files provided",
      });
    }

    const bad = files.find((f: any) => !toAssetType(f.mimetype, f.filename));
    if (bad) {
      return sendError(reply, {
        statusCode: 415,
        message: "Only image or PDF files are allowed",
      });
    }

    const uploadDir = path.join(process.cwd(), "./uploads");

    const baseUrl = process.env.UPLOAD_URL;
    if (!baseUrl) {
      throw new AppError("UPLOAD_URL is not configured", 500);
    }

    const assets = await Promise.all(
      files.map(async (file: any) => {
        const saved = await saveFileToUploads(file, uploadDir);

        const type = toAssetType(file.mimetype, saved.filename);
        if (!type) {
          throw new AppError("Unsupported file type", 415);
        }

        return {
          type,
          url: `${baseUrl}/uploads/${saved.filename}`,
          originalName: file.filename,
          mimetype: file.mimetype,
        };
      })
    );

    return sendSuccess(reply, {
      statusCode: 201,
      message: "uploaded",
      data: assets,
    });
  } catch (err: any) {
    request.log.error(err, "Upload failed");

    if (err instanceof AppError) {
      return sendError(reply, {
        statusCode: err.statusCode,
        message: err.message,
      });
    }

    return sendError(reply, {
      statusCode: 500,
      message: "Failed to upload files",
    });
  }
};