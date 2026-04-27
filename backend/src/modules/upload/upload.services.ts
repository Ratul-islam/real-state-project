import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { AppError } from "../../utils/AppError.js";

export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const extMap: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

export type MultipartUploadFile = {
  mimetype: string;
  filename: string; 

  file?: NodeJS.ReadableStream;
  filepath?: string;
  size?: number;
  remove?: () => Promise<void>;
};

export type UploadAssetType = "image" | "pdf";

function assetTypeFromMime(mimetype: string): UploadAssetType | null {
  const mt = (mimetype || "").toLowerCase();
  if (mt === "application/pdf") return "pdf";
  if (mt.startsWith("image/")) return "image";
  return null;
}

// ✅ validates image OR pdf
export function validateFile(file: { mimetype: string }) {
  const mimetype = (file.mimetype || "").toLowerCase();
  const type = assetTypeFromMime(mimetype);
  if (!type) {
    throw new AppError("Only image or PDF files are allowed", 415);
  }

  const ext = extMap[mimetype];
  if (!ext) {
    // e.g. image/bmp not allowed
    throw new AppError("Unsupported file type", 415);
  }

  return { ext, type };
}

async function safeRemoveTemp(file: MultipartUploadFile) {
  if (typeof file.remove === "function") {
    try {
      await file.remove();
      return;
    } catch {}
  }

  if (file.filepath) {
    try {
      await fsp.unlink(file.filepath);
    } catch {}
  }
}

async function safeMoveOrCopy(srcPath: string, destPath: string) {
  try {
    await fsp.rename(srcPath, destPath);
  } catch {
    await fsp.copyFile(srcPath, destPath);
    await fsp.unlink(srcPath);
  }
}

export async function saveFileToUploads(
  file: MultipartUploadFile,
  uploadDir: string
) {
  ensureDir(uploadDir);

  const { ext, type } = validateFile(file);
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
  const destPath = path.join(uploadDir, filename);

  try {
    if (file.filepath) {
      await safeMoveOrCopy(file.filepath, destPath);
      return { filename, filepath: destPath, type };
    }

    if (!file.file) {
      throw new AppError("Invalid upload payload", 400);
    }

    await new Promise<void>((resolve, reject) => {
      const ws = fs.createWriteStream(destPath);

      file.file!.on("error", reject);
      ws.on("error", reject);
      ws.on("finish", resolve);

      file.file!.pipe(ws);
    });

    return { filename, filepath: destPath, type };
  } catch (err) {
    try {
      if (fs.existsSync(destPath)) await fsp.unlink(destPath);
    } catch {}

    await safeRemoveTemp(file);

    throw err;
  }
}