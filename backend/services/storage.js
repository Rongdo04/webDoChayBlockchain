// services/storage.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import mime from "mime-types";

// Set ffmpeg binary path
ffmpeg.setFfmpegPath(ffmpegStatic);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const UPLOAD_DIR = path.join(__dirname, "../uploads");
const THUMBNAIL_DIR = path.join(__dirname, "../uploads/thumbnails");
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_VIDEO_MIMES = [
  "video/mp4",
  "video/webm",
  "video/mov",
  "video/avi",
  "video/quicktime", // .mov on some systems
  "video/x-msvideo", // .avi on some systems
];
const ALLOWED_MIMES = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES];

// S3 Configuration
const s3Client = process.env.AWS_ACCESS_KEY_ID
  ? new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

const S3_BUCKET = process.env.S3_BUCKET || "your-media-bucket";
const S3_REGION = process.env.AWS_REGION || "us-east-1";

// Ensure upload directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create upload directories:", error);
  }
}

// Initialize directories
ensureDirectories();

// Utility functions
export function generateFilename(originalName, mimeType) {
  const ext = mime.extension(mimeType) || path.extname(originalName).slice(1);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString("hex");
  return `${timestamp}-${random}.${ext}`;
}

export function getFileType(mimeType) {
  if (ALLOWED_IMAGE_MIMES.includes(mimeType)) return "image";
  if (ALLOWED_VIDEO_MIMES.includes(mimeType)) return "video";
  return null;
}

export function validateFile(file) {
  const errors = [];

  if (!file) {
    errors.push("No file provided");
    return errors;
  }

  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    errors.push(`Unsupported file type: ${file.mimetype}`);
  }

  if (file.size > MAX_FILE_SIZE) {
    errors.push(
      `File size exceeds limit: ${Math.round(file.size / 1024 / 1024)}MB > ${
        MAX_FILE_SIZE / 1024 / 1024
      }MB`
    );
  }

  return errors;
}

// Local storage functions
export async function saveLocalFile(file, filename) {
  const filepath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filepath, file.buffer);

  const baseUrl = process.env.BASE_URL || "http://localhost:8000";
  const url = `${baseUrl}/uploads/${filename}`;

  return {
    url,
    storageKey: filename,
    storageType: "local",
  };
}

export async function deleteLocalFile(storageKey) {
  try {
    const filepath = path.join(UPLOAD_DIR, storageKey);
    await fs.unlink(filepath);

    // Also delete thumbnail if exists (image: thumb_<filename>, video: thumb_<name>.jpg)
    const candidates = [
      path.join(THUMBNAIL_DIR, `thumb_${storageKey}`),
      path.join(THUMBNAIL_DIR, `thumb_${path.parse(storageKey).name}.jpg`),
    ];
    for (const thumbPath of candidates) {
      try {
        await fs.unlink(thumbPath);
      } catch (_) {
        // ignore
      }
    }

    return true;
  } catch (error) {
    console.error("Failed to delete local file:", error);
    return false;
  }
}

// Thumbnail generation
export async function generateThumbnail(sourceFile, filename, type) {
  if (type === "image") {
    return generateImageThumbnail(sourceFile, filename);
  } else if (type === "video") {
    return generateVideoThumbnail(sourceFile, filename);
  }
  return null;
}

async function generateImageThumbnail(sourceFile, filename) {
  try {
    const thumbnailFilename = `thumb_${filename}`;
    const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailFilename);

    await sharp(sourceFile.buffer)
      .resize(300, 300, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    const baseUrl = process.env.BASE_URL || "http://localhost:8000";
    return `${baseUrl}/uploads/thumbnails/${thumbnailFilename}`;
  } catch (error) {
    console.error("Failed to generate image thumbnail:", error);
    return null;
  }
}

async function generateVideoThumbnail(sourceFile, filename) {
  try {
    const tempVideoPath = path.join(UPLOAD_DIR, `temp_${filename}`);
    const thumbnailFilename = `thumb_${path.parse(filename).name}.jpg`;
    const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailFilename);

    // Write temp video file
    await fs.writeFile(tempVideoPath, sourceFile.buffer);

    return new Promise((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .screenshots({
          timestamps: ["00:00:01"],
          filename: thumbnailFilename,
          folder: THUMBNAIL_DIR,
          size: "300x300",
        })
        .on("end", async () => {
          try {
            // Clean up temp file
            await fs.unlink(tempVideoPath);
            const baseUrl = process.env.BASE_URL || "http://localhost:8000";
            resolve(`${baseUrl}/uploads/thumbnails/${thumbnailFilename}`);
          } catch (e) {
            reject(e);
          }
        })
        .on("error", async (err) => {
          try {
            await fs.unlink(tempVideoPath);
          } catch (e) {
            // Ignore cleanup errors
          }
          reject(err);
        });
    });
  } catch (error) {
    console.error("Failed to generate video thumbnail:", error);
    return null;
  }
}

// Get file metadata
export async function getFileMetadata(file, type) {
  const metadata = {};

  if (type === "image") {
    try {
      const imageInfo = await sharp(file.buffer).metadata();
      metadata.width = imageInfo.width;
      metadata.height = imageInfo.height;
      metadata.format = imageInfo.format;
    } catch (error) {
      console.error("Failed to get image metadata:", error);
    }
  } else if (type === "video") {
    // For video metadata, we'd need to probe the file
    // This is more complex and might require temporary file storage
    metadata.format = mime.extension(file.mimetype);
  }

  return metadata;
}

// S3 functions
export async function createPresignedUrl(filename, mimeType) {
  if (!s3Client) {
    throw new Error("S3 not configured");
  }

  const key = `media/${Date.now()}-${filename}`;
  const conditions = [
    ["content-length-range", 1, MAX_FILE_SIZE],
    ["starts-with", "$Content-Type", mimeType.split("/")[0] + "/"],
  ];

  try {
    const presigned = await createPresignedPost(s3Client, {
      Bucket: S3_BUCKET,
      Key: key,
      Conditions: conditions,
      Fields: {
        "Content-Type": mimeType,
      },
      Expires: 3600, // 1 hour
    });

    return {
      url: presigned.url,
      fields: presigned.fields,
      key,
    };
  } catch (error) {
    console.error("Failed to create presigned URL:", error);
    throw new Error("Failed to generate upload URL");
  }
}

export function getS3Url(key) {
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
}

// Storage factory
export class StorageService {
  static async uploadFile(file, options = {}) {
    const { forceLocal = false, generateThumb = true } = options;

    const validation = validateFile(file);
    if (validation.length > 0) {
      throw new Error(validation.join(", "));
    }

    const filename = generateFilename(file.originalname, file.mimetype);
    const type = getFileType(file.mimetype);

    // Use S3 if configured and not forced local
    const useS3 = s3Client && !forceLocal;

    let result;
    if (useS3) {
      // For S3, we return presigned URL for client upload
      const presigned = await createPresignedUrl(filename, file.mimetype);
      result = {
        storageType: "s3",
        storageKey: presigned.key,
        url: null, // Will be set after client confirms upload
        presigned,
      };
    } else {
      // Local storage
      const localResult = await saveLocalFile(file, filename);
      result = localResult;
    }

    // Generate thumbnail for local files
    let thumbnailUrl = null;
    if (!useS3 && generateThumb) {
      thumbnailUrl = await generateThumbnail(file, filename, type);
    }

    // Get metadata
    const metadata = await getFileMetadata(file, type);

    return {
      filename,
      type,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
      thumbnailUrl,
      metadata,
      ...result,
    };
  }

  static async deleteFile(storageType, storageKey) {
    if (storageType === "local") {
      return deleteLocalFile(storageKey);
    } else if (storageType === "s3") {
      // TODO: Implement S3 deletion
      console.warn("S3 file deletion not implemented");
      return true;
    }
    return false;
  }

  static isS3Available() {
    return !!s3Client;
  }
}

export default StorageService;
