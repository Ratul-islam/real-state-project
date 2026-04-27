"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImages = void 0;
const node_path_1 = __importDefault(require("node:path"));
const upload_services_js_1 = require("./upload.services.js");
const responses_js_1 = require("../../utils/responses.js");
const AppError_js_1 = require("../../utils/AppError.js");
function toAssetType(mimetype, filename) {
    const mt = (mimetype || "").toLowerCase();
    const name = (filename || "").toLowerCase();
    if (mt === "application/pdf" || name.endsWith(".pdf"))
        return "pdf";
    if (mt.startsWith("image/"))
        return "image";
    return null;
}
const uploadImages = async (request, reply) => {
    try {
        const files = await request.saveRequestFiles({
            limits: {
                files: 20,
                fileSize: 10 * 1024 * 1024,
            },
        });
        if (!files.length) {
            return (0, responses_js_1.sendError)(reply, {
                statusCode: 400,
                message: "No files provided",
            });
        }
        const bad = files.find((f) => !toAssetType(f.mimetype, f.filename));
        if (bad) {
            return (0, responses_js_1.sendError)(reply, {
                statusCode: 415,
                message: "Only image or PDF files are allowed",
            });
        }
        const uploadDir = node_path_1.default.join(process.cwd(), "./uploads");
        const baseUrl = process.env.UPLOAD_URL;
        if (!baseUrl) {
            throw new AppError_js_1.AppError("UPLOAD_URL is not configured", 500);
        }
        const assets = await Promise.all(files.map(async (file) => {
            const saved = await (0, upload_services_js_1.saveFileToUploads)(file, uploadDir);
            const type = toAssetType(file.mimetype, saved.filename);
            if (!type) {
                throw new AppError_js_1.AppError("Unsupported file type", 415);
            }
            return {
                type,
                url: `${baseUrl}/uploads/${saved.filename}`,
                originalName: file.filename,
                mimetype: file.mimetype,
            };
        }));
        return (0, responses_js_1.sendSuccess)(reply, {
            statusCode: 201,
            message: "uploaded",
            data: assets,
        });
    }
    catch (err) {
        request.log.error(err, "Upload failed");
        if (err instanceof AppError_js_1.AppError) {
            return (0, responses_js_1.sendError)(reply, {
                statusCode: err.statusCode,
                message: err.message,
            });
        }
        return (0, responses_js_1.sendError)(reply, {
            statusCode: 500,
            message: "Failed to upload files",
        });
    }
};
exports.uploadImages = uploadImages;
