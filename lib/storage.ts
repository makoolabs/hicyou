/**
 * Storage Provider Abstraction
 * Supports: Cloudflare R2, Qiniu Kodo, Local (dev fallback)
 * All providers use S3-compatible API
 */

import { S3Client } from "@aws-sdk/client-s3";

// ---- Provider Types ----
export type StorageProvider = "r2" | "qiniu" | "local";

// ---- Config Detection ----
function detectProvider(): StorageProvider {
  // Explicit override
  if (process.env.STORAGE_PROVIDER) {
    return process.env.STORAGE_PROVIDER as StorageProvider;
  }
  // Auto-detect
  if (process.env.QINIU_ACCESS_KEY && process.env.QINIU_SECRET_KEY) return "qiniu";
  if (process.env.R2_ACCOUNT_ID) return "r2";
  return "local";
}

export const currentProvider = detectProvider();

// ---- Storage Config ----
interface StorageConfig {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
  uploadDir: string;
  logoDir: string;
  coverDir: string;
}

function getConfig(): StorageConfig {
  const uploadDir = process.env.STORAGE_UPLOAD_DIR || "uploads";
  const logoDir = process.env.STORAGE_LOGO_DIR || "logos";
  const coverDir = process.env.STORAGE_COVER_DIR || "covers";

  switch (currentProvider) {
    case "r2":
      return {
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        bucketName: process.env.R2_BUCKET_NAME || "",
        publicUrl: process.env.R2_PUBLIC_URL || "",
        uploadDir,
        logoDir,
        coverDir,
      };
    case "qiniu":
      return {
        endpoint: process.env.QINIU_ENDPOINT || "https://s3.cn-east-1.qiniucs.com",
        accessKeyId: process.env.QINIU_ACCESS_KEY || "",
        secretAccessKey: process.env.QINIU_SECRET_KEY || "",
        bucketName: process.env.QINIU_BUCKET || "",
        publicUrl: process.env.QINIU_PUBLIC_URL || "",
        uploadDir,
        logoDir,
        coverDir,
      };
    case "local":
    default:
      return {
        endpoint: "",
        accessKeyId: "",
        secretAccessKey: "",
        bucketName: "local",
        publicUrl: "/storage",
        uploadDir,
        logoDir,
        coverDir,
      };
  }
}

export const storageConfig = getConfig();

// ---- S3 Client ----
export const isConfigured = currentProvider !== "local";

export const storageClient = isConfigured
  ? new S3Client({
      region: "auto",
      endpoint: storageConfig.endpoint,
      credentials: {
        accessKeyId: storageConfig.accessKeyId,
        secretAccessKey: storageConfig.secretAccessKey,
      },
      forcePathStyle: true, // Required for Qiniu
    })
  : null;

// ---- Path Helpers ----
export function getStoragePath(type: "logo" | "cover", filename: string): string {
  const dir = type === "logo" ? storageConfig.logoDir : storageConfig.coverDir;
  return `${storageConfig.uploadDir}/${dir}/${filename}`;
}

export function getPublicUrl(path: string): string {
  if (currentProvider === "local") {
    return `/storage/${path}`;
  }
  return `${storageConfig.publicUrl}/${path}`;
}

// ---- Local Storage (Dev Fallback) ----
import fs from "fs/promises";
import path from "path";

export async function saveLocal(buffer: Buffer, filename: string): Promise<string> {
  const dir = path.join(process.cwd(), "public", "storage", storageConfig.uploadDir);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buffer);
  return `/storage/${storageConfig.uploadDir}/${filename}`;
}
