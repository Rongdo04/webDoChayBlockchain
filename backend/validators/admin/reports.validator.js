// validators/admin/reports.validator.js
import mongoose from "mongoose";
import { body } from "express-validator";

function buildError(details) {
  const err = new Error("Validation failed");
  err.status = 422;
  err.code = "VALIDATION_ERROR";
  err.details = details;
  return err;
}

// Custom validator for MongoDB ObjectId
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// Validate report ID parameter
export function validateReportId(req, res, next) {
  const errors = {};
  const { id } = req.params;

  if (!id || !isValidObjectId(id)) {
    errors.id = "Invalid report ID format";
  }

  if (Object.keys(errors).length > 0) {
    return next(buildError(errors));
  }
  next();
}

// Validate list reports query parameters
export function validateListReports(req, res, next) {
  const errors = {};
  const { status, targetType, reason, cursor, limit, sort } = req.query;

  // Validate status
  if (status && !["open", "resolved"].includes(status)) {
    errors.status = "Status must be 'open' or 'resolved'";
  }

  // Validate targetType
  if (targetType && !["comment", "recipe"].includes(targetType)) {
    errors.targetType = "Target type must be 'comment' or 'recipe'";
  }

  // Validate reason
  if (
    reason &&
    ![
      "spam",
      "abuse",
      "inappropriate",
      "misinformation",
      "copyright",
      "other",
    ].includes(reason)
  ) {
    errors.reason = "Invalid reason value";
  }

  // Validate cursor (should be valid ObjectId)
  if (cursor && !isValidObjectId(cursor)) {
    errors.cursor = "Invalid cursor format";
  }

  // Validate limit
  if (limit) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.limit = "Limit must be a number between 1 and 100";
    }
  }

  // Validate sort
  if (sort && !["newest", "oldest"].includes(sort)) {
    errors.sort = "Sort must be 'newest' or 'oldest'";
  }

  if (Object.keys(errors).length > 0) {
    return next(buildError(errors));
  }
  next();
}

// Validate resolve report request
export function validateResolveReport(req, res, next) {
  const errors = {};
  const { resolution, note } = req.body;

  // Validate resolution action
  if (!resolution) {
    errors.resolution = "Resolution action is required";
  } else if (!["no_action", "hidden", "removed"].includes(resolution)) {
    errors.resolution =
      "Resolution must be 'no_action', 'hidden', or 'removed'";
  }

  // Validate note (optional)
  if (note !== undefined) {
    if (typeof note !== "string") {
      errors.note = "Note must be a string";
    } else if (note.length > 500) {
      errors.note = "Note cannot exceed 500 characters";
    }
  }

  if (Object.keys(errors).length > 0) {
    return next(buildError(errors));
  }
  next();
}

// Validate create report request (for user API)
export function validateCreateReport(req, res, next) {
  const errors = {};
  const { targetType, targetId, reason, description } = req.body;

  // Validate targetType
  if (!targetType) {
    errors.targetType = "Target type is required";
  } else if (!["comment", "recipe"].includes(targetType)) {
    errors.targetType = "Target type must be 'comment' or 'recipe'";
  }

  // Validate targetId
  if (!targetId) {
    errors.targetId = "Target ID is required";
  } else if (!isValidObjectId(targetId)) {
    errors.targetId = "Invalid target ID format";
  }

  // Validate reason
  if (!reason) {
    errors.reason = "Reason is required";
  } else if (
    ![
      "spam",
      "abuse",
      "inappropriate",
      "misinformation",
      "copyright",
      "other",
    ].includes(reason)
  ) {
    errors.reason = "Invalid reason value";
  }

  // Validate description (optional)
  if (description !== undefined) {
    if (typeof description !== "string") {
      errors.description = "Description must be a string";
    } else if (description.length > 1000) {
      errors.description = "Description cannot exceed 1000 characters";
    }
  }

  if (Object.keys(errors).length > 0) {
    return next(buildError(errors));
  }
  next();
}

// Update report status validator
export const validateUpdateStatus = [
  body("status")
    .isString()
    .isIn(["pending", "reviewed", "resolved", "rejected"])
    .withMessage("Trạng thái không hợp lệ"),
  body("notes")
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage("Ghi chú không được quá 1000 ký tự"),
];

export default {
  validateReportId,
  validateListReports,
  validateResolveReport,
  validateCreateReport,
  validateUpdateStatus,
};
