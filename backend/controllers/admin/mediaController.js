// controllers/admin/mediaController.js
import multer from "multer";
import {
  createMedia,
  updateMedia,
  getMedia,
  deleteMedia,
  listMedia,
  bulkDeleteMedia,
  bulkUpdateTags as bulkUpdateTagsRepo,
  getMediaStats,
  cleanupFailedUploads,
} from "../../repositories/media.repo.js";
import StorageService, {
  createPresignedUrl,
  getS3Url,
  getFileType,
} from "../../services/storage.js";

// Configure multer for file uploads
const storage = multer.memoryStorage();
const uploadMulter = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

export const uploadMiddleware = uploadMulter.single("file");

function notFound(id) {
  const e = new Error("Media not found");
  e.status = 404;
  e.code = "MEDIA_NOT_FOUND";
  e.details = { id };
  return e;
}

// List media with filtering and pagination
export const list = async (req, res) => {
  const result = await listMedia(req.query);
  res.json(result);
};

// Get single media item
export const getOne = async (req, res, next) => {
  const media = await getMedia(req.params.id);
  if (!media) return next(notFound(req.params.id));
  res.json(media);
};

// Upload file (local storage)
export const upload = async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error("No file uploaded");
      err.status = 400;
      err.code = "NO_FILE";
      return next(err);
    }

    // Upload file using storage service
    const uploadResult = await StorageService.uploadFile(req.file, {
      forceLocal: req.body.forceLocal === "true",
      generateThumb: req.body.generateThumb !== "false",
    });

    // Create media record
    const mediaData = {
      ...uploadResult,
      alt: req.body.alt || "",
      tags: req.processedTags || [],
    };

    const media = await createMedia(mediaData, req.user, req);

    res.status(201).json(media);
  } catch (error) {
    const err = new Error(error.message);
    err.status = 400;
    err.code = "UPLOAD_FAILED";
    next(err);
  }
};

// Create presigned URL for S3 upload
export const presign = async (req, res, next) => {
  try {
    if (!StorageService.isS3Available()) {
      const err = new Error("S3 storage not configured");
      err.status = 503;
      err.code = "S3_UNAVAILABLE";
      return next(err);
    }

    const { filename, mime } = req.body;
    const presigned = await createPresignedUrl(filename, mime);

    res.json({
      url: presigned.url,
      fields: presigned.fields,
      key: presigned.key,
      type: getFileType(mime),
    });
  } catch (error) {
    const err = new Error(error.message);
    err.status = 400;
    err.code = "PRESIGN_FAILED";
    next(err);
  }
};

// Confirm S3 upload and create media record
export const confirm = async (req, res, next) => {
  try {
    const { key, url, alt, tags } = req.body;

    // For S3 uploads, we need to determine the file details from the key/URL
    // This is a simplified version - in production you might want to validate the upload
    const filename = key.split("/").pop();
    const extension = filename.split(".").pop().toLowerCase();

    // Determine MIME type from extension (simplified)
    const mimeMap = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/mov",
      avi: "video/avi",
    };

    const mimeType = mimeMap[extension] || "application/octet-stream";
    const type = getFileType(mimeType);

    if (!type) {
      const err = new Error("Unsupported file type");
      err.status = 400;
      err.code = "INVALID_FILE_TYPE";
      return next(err);
    }

    const fileUrl = url || getS3Url(key);

    const mediaData = {
      filename,
      originalName: filename,
      mimeType,
      size: 0, // We don't have size info from S3 presigned upload
      type,
      url: fileUrl,
      storageType: "s3",
      storageKey: key,
      alt: alt || "",
      tags: tags || [],
      status: "ready",
    };

    const media = await createMedia(mediaData, req.user, req);

    res.status(201).json(media);
  } catch (error) {
    const err = new Error(error.message);
    err.status = 400;
    err.code = "CONFIRM_FAILED";
    next(err);
  }
};

// Update media metadata
export const update = async (req, res, next) => {
  const media = await updateMedia(req.params.id, req.body, req.user, req);
  if (!media) return next(notFound(req.params.id));
  res.json(media);
};

// Delete media
export const remove = async (req, res, next) => {
  const media = await deleteMedia(req.params.id, req.user, req);
  if (!media) return next(notFound(req.params.id));

  // Delete actual file from storage
  try {
    await StorageService.deleteFile(media.storageType, media.storageKey);
  } catch (error) {
    console.error("Failed to delete file from storage:", error);
    // Continue anyway - we've removed the DB record
  }

  res.status(204).end();
};

// Bulk delete media
export const bulkDelete = async (req, res) => {
  const { ids } = req.body;
  const result = await bulkDeleteMedia(ids, req.user, req);

  // Delete actual files from storage
  for (const item of result.processed) {
    try {
      await StorageService.deleteFile(
        item.media.storageType,
        item.media.storageKey
      );
    } catch (error) {
      console.error("Failed to delete file from storage:", error);
    }
  }

  res.json(result);
};

// Bulk update tags
export const bulkUpdateTags = async (req, res) => {
  const { ids, tags } = req.body;
  const result = await bulkUpdateTagsRepo(ids, tags, req.user, req);
  res.json(result);
};

// Get media statistics
export const stats = async (req, res) => {
  const result = await getMediaStats(req.query);
  res.json(result);
};

// Cleanup operations
export const cleanup = async (req, res) => {
  const { action = "failed", hours = 24 } = req.query;

  let result;
  if (action === "failed") {
    result = await cleanupFailedUploads(Number(hours));
  } else {
    const err = new Error("Unsupported cleanup action");
    err.status = 400;
    err.code = "INVALID_ACTION";
    return next(err);
  }

  res.json(result);
};

export default {
  uploadMiddleware,
  list,
  getOne,
  uploadFile: upload,
  presign,
  confirm,
  update,
  remove,
  bulkDelete,
  bulkUpdateTags,
  stats,
  cleanup,
};
