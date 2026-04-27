"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDir = ensureDir;
exports.validateFile = validateFile;
exports.saveFileToUploads = saveFileToUploads;
const node_fs_1 = __importDefault(require("node:fs"));
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const AppError_js_1 = require("../../utils/AppError.js");
function ensureDir(dir) {
    if (!node_fs_1.default.existsSync(dir))
        node_fs_1.default.mkdirSync(dir, { recursive: true });
}
const extMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "application/pdf": "pdf",
};
function assetTypeFromMime(mimetype) {
    const mt = (mimetype || "").toLowerCase();
    if (mt === "application/pdf")
        return "pdf";
    if (mt.startsWith("image/"))
        return "image";
    return null;
}
// ✅ validates image OR pdf
function validateFile(file) {
    const mimetype = (file.mimetype || "").toLowerCase();
    const type = assetTypeFromMime(mimetype);
    if (!type) {
        throw new AppError_js_1.AppError("Only image or PDF files are allowed", 415);
    }
    const ext = extMap[mimetype];
    if (!ext) {
        // e.g. image/bmp not allowed
        throw new AppError_js_1.AppError("Unsupported file type", 415);
    }
    return { ext, type };
}
async function safeRemoveTemp(file) {
    if (typeof file.remove === "function") {
        try {
            await file.remove();
            return;
        }
        catch { }
    }
    if (file.filepath) {
        try {
            await promises_1.default.unlink(file.filepath);
        }
        catch { }
    }
}
async function safeMoveOrCopy(srcPath, destPath) {
    try {
        await promises_1.default.rename(srcPath, destPath);
    }
    catch {
        await promises_1.default.copyFile(srcPath, destPath);
        await promises_1.default.unlink(srcPath);
    }
}
async function saveFileToUploads(file, uploadDir) {
    ensureDir(uploadDir);
    const { ext, type } = validateFile(file);
    const filename = `${Date.now()}-${node_crypto_1.default.randomBytes(8).toString("hex")}.${ext}`;
    const destPath = node_path_1.default.join(uploadDir, filename);
    try {
        if (file.filepath) {
            await safeMoveOrCopy(file.filepath, destPath);
            return { filename, filepath: destPath, type };
        }
        if (!file.file) {
            throw new AppError_js_1.AppError("Invalid upload payload", 400);
        }
        await new Promise((resolve, reject) => {
            const ws = node_fs_1.default.createWriteStream(destPath);
            file.file.on("error", reject);
            ws.on("error", reject);
            ws.on("finish", resolve);
            file.file.pipe(ws);
        });
        return { filename, filepath: destPath, type };
    }
    catch (err) {
        try {
            if (node_fs_1.default.existsSync(destPath))
                await promises_1.default.unlink(destPath);
        }
        catch { }
        await safeRemoveTemp(file);
        throw err;
    }
}
