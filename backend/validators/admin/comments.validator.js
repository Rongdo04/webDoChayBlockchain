// validators/admin/comments.validator.js
import mongoose from "mongoose";

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

// Validate comment ID parameter
export function validateCommentId(req, res, next) {
  const errors = {};
  const { id } = req.params;

  if (!id || !isValidObjectId(id)) {
    errors.id = "Invalid comment ID format";
  }

  if (Object.keys(errors).length > 0) {
    return next(buildError(errors));
  }
  next();
}

// Validate list comments query parameters
export function validateListComments(req, res, next) {
  const errors = {};
  const { status, recipeId, cursor, limit, sort, order } = req.query;

  if (status && !["pending", "approved", "hidden"].includes(status)) {
    errors.status = "Status must be pending, approved, or hidden";
  }

  if (recipeId && !isValidObjectId(recipeId)) {
    errors.recipeId = "Invalid recipe ID format";
  }

  if (cursor && !isValidObjectId(cursor)) {
    errors.cursor = "Invalid cursor format";
  }

  if (limit) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.limit = "Limit must be between 1 and 100";
    }
  }

  if (sort && !["createdAt", "updatedAt"].includes(sort)) {
    errors.sort = "Sort must be createdAt or updatedAt";
  }

  if (order && !["asc", "desc"].includes(order)) {
    errors.order = "Order must be asc or desc";
  }

  if (Object.keys(errors).length > 0) {
    return next(buildError(errors));
  }
  next();
}

// Validate hide comment request
export function validateHideComment(req, res, next) {
  const errors = {};
  const { id } = req.params;
  const { reason } = req.body;

  if (!id || !isValidObjectId(id)) {
    errors.id = "Invalid comment ID format";
  }

  if (reason !== undefined) {
    if (typeof reason !== "string") {
      errors.reason = "Reason must be a string";
    } else if (reason.trim().length > 500) {
      errors.reason = "Reason must be maximum 500 characters";
    }
  }

  if (Object.keys(errors).length > 0) {
    return next(buildError(errors));
  }
  next();
}

// Validate bulk operations
export function validateBulkComments(req, res, next) {
  const errors = {};
  const { ids, action, reason } = req.body;

  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 50) {
    errors.ids = "IDs must be an array with 1-50 items";
  } else if (!ids.every((id) => isValidObjectId(id))) {
    errors.ids = "All IDs must be valid MongoDB ObjectIds";
  }

  if (!action || !["approve", "hide"].includes(action)) {
    errors.action = "Action must be approve or hide";
  }

  if (reason !== undefined) {
    if (typeof reason !== "string") {
      errors.reason = "Reason must be a string";
    } else if (reason.trim().length > 500) {
      errors.reason = "Reason must be maximum 500 characters";
    }
  }

  if (Object.keys(errors).length > 0) {
    return next(buildError(errors));
  }
  next();
}

export default {
  validateCommentId,
  validateListComments,
  validateHideComment,
  validateBulkComments,
};
