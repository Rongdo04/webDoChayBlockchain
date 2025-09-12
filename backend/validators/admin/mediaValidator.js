// validators/admin/mediaValidator.js
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
];
const ALLOWED_MIMES = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_TAG_LENGTH = 50;
const MAX_ALT_LENGTH = 500;

function buildError(details) {
  const err = new Error("Validation failed");
  err.status = 422;
  err.code = "VALIDATION_ERROR";
  err.details = details;
  return err;
}

export function validateUpload(req, res, next) {
  const errors = {};

  if (!req.file) {
    errors.file = "No file uploaded";
    return next(buildError(errors));
  }

  const file = req.file;

  // MIME type validation
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    errors.mimetype = `Unsupported file type. Allowed: ${ALLOWED_MIMES.join(
      ", "
    )}`;
  }

  // File size validation
  if (file.size > MAX_FILE_SIZE) {
    errors.size = `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }

  // Validate optional metadata
  if (req.body.alt && req.body.alt.length > MAX_ALT_LENGTH) {
    errors.alt = `Alt text too long. Max length: ${MAX_ALT_LENGTH}`;
  }

  if (req.body.tags) {
    try {
      const tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : typeof req.body.tags === "string"
        ? req.body.tags.split(",")
        : [];

      const invalidTags = tags.filter(
        (tag) =>
          typeof tag !== "string" ||
          tag.trim().length === 0 ||
          tag.trim().length > MAX_TAG_LENGTH
      );

      if (invalidTags.length > 0) {
        errors.tags = `Invalid tags. Each tag must be 1-${MAX_TAG_LENGTH} characters`;
      }

      // Store processed tags
      req.processedTags = tags
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);
    } catch (e) {
      errors.tags = "Invalid tags format";
    }
  }

  if (Object.keys(errors).length) return next(buildError(errors));
  next();
}

export function validatePresign(req, res, next) {
  const errors = {};
  const { filename, mime } = req.body;

  if (
    !filename ||
    typeof filename !== "string" ||
    filename.trim().length === 0
  ) {
    errors.filename = "Filename is required";
  }

  if (!mime || typeof mime !== "string") {
    errors.mime = "MIME type is required";
  } else if (!ALLOWED_MIMES.includes(mime)) {
    errors.mime = `Unsupported MIME type. Allowed: ${ALLOWED_MIMES.join(", ")}`;
  }

  if (Object.keys(errors).length) return next(buildError(errors));
  next();
}

export function validateConfirm(req, res, next) {
  const errors = {};
  const { key, url, alt, tags } = req.body;

  if (!key || typeof key !== "string" || key.trim().length === 0) {
    errors.key = "Storage key is required";
  }

  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    errors.url = "Valid URL is required";
  }

  if (alt && typeof alt !== "string") {
    errors.alt = "Alt text must be a string";
  } else if (alt && alt.length > MAX_ALT_LENGTH) {
    errors.alt = `Alt text too long. Max length: ${MAX_ALT_LENGTH}`;
  }

  if (tags) {
    if (!Array.isArray(tags)) {
      errors.tags = "Tags must be an array";
    } else {
      const invalidTags = tags.filter(
        (tag) =>
          typeof tag !== "string" ||
          tag.trim().length === 0 ||
          tag.trim().length > MAX_TAG_LENGTH
      );

      if (invalidTags.length > 0) {
        errors.tags = `Invalid tags. Each tag must be 1-${MAX_TAG_LENGTH} characters`;
      }
    }
  }

  if (Object.keys(errors).length) return next(buildError(errors));
  next();
}

export function validateUpdate(req, res, next) {
  const errors = {};
  const { alt, tags } = req.body;

  if (!alt && !tags) {
    errors.body = "At least one field (alt, tags) must be provided";
  }

  if (alt !== undefined) {
    if (typeof alt !== "string") {
      errors.alt = "Alt text must be a string";
    } else if (alt.length > MAX_ALT_LENGTH) {
      errors.alt = `Alt text too long. Max length: ${MAX_ALT_LENGTH}`;
    }
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      errors.tags = "Tags must be an array";
    } else {
      const invalidTags = tags.filter(
        (tag) =>
          typeof tag !== "string" ||
          tag.trim().length === 0 ||
          tag.trim().length > MAX_TAG_LENGTH
      );

      if (invalidTags.length > 0) {
        errors.tags = `Invalid tags. Each tag must be 1-${MAX_TAG_LENGTH} characters`;
      }
    }
  }

  if (Object.keys(errors).length) return next(buildError(errors));
  next();
}

export function validateListQuery(req, res, next) {
  const errors = {};
  const { type, limit, sort } = req.query;

  if (type && !["image", "video"].includes(type)) {
    errors.type = 'Type must be "image" or "video"';
  }

  if (limit && (isNaN(limit) || Number(limit) < 1 || Number(limit) > 100)) {
    errors.limit = "Limit must be between 1 and 100";
  }

  const validSorts = ["new", "oldest", "name", "size", "type", "usage"];
  if (sort && !validSorts.includes(sort)) {
    errors.sort = `Sort must be one of: ${validSorts.join(", ")}`;
  }

  if (Object.keys(errors).length) return next(buildError(errors));
  next();
}

export function validateBulkDelete(req, res, next) {
  const errors = {};
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    errors.ids = "IDs array is required and cannot be empty";
  } else if (ids.length > 50) {
    errors.ids = "Cannot delete more than 50 items at once";
  } else {
    const invalidIds = ids.filter(
      (id) => typeof id !== "string" || id.length !== 24
    );
    if (invalidIds.length > 0) {
      errors.ids = "All IDs must be valid MongoDB ObjectIds";
    }
  }

  if (Object.keys(errors).length) return next(buildError(errors));
  next();
}

export function validateBulkUpdateTags(req, res, next) {
  const errors = {};
  const { ids, tags } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    errors.ids = "IDs array is required and cannot be empty";
  } else if (ids.length > 100) {
    errors.ids = "Cannot update more than 100 items at once";
  }

  if (!Array.isArray(tags)) {
    errors.tags = "Tags must be an array";
  } else {
    const invalidTags = tags.filter(
      (tag) =>
        typeof tag !== "string" ||
        tag.trim().length === 0 ||
        tag.trim().length > MAX_TAG_LENGTH
    );

    if (invalidTags.length > 0) {
      errors.tags = `Invalid tags. Each tag must be 1-${MAX_TAG_LENGTH} characters`;
    }
  }

  if (Object.keys(errors).length) return next(buildError(errors));
  next();
}

export default {
  validateUpload,
  validatePresign,
  validateConfirm,
  validateUpdate,
  validateListQuery,
  validateBulkDelete,
  validateBulkUpdateTags,
};
