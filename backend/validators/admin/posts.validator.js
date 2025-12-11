// validators/admin/posts.validator.js
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

// Validate post ID parameter
export function validatePostId(req, res, next) {
  const errors = {};
  const { id } = req.params;

  if (!id || !isValidObjectId(id)) {
    errors.id = "Invalid post ID format";
  }

  if (Object.keys(errors).length > 0) {
    return next(buildError(errors));
  }
  next();
}

// Validate list posts query parameters
export function validateListPosts(req, res, next) {
  const errors = {};
  const { status, tag, cursor, limit, sort } = req.query;

  // Validate status
  if (status && !["pending", "published", "hidden"].includes(status)) {
    errors.status = "Status must be 'pending', 'published', or 'hidden'";
  }

  // Validate tag
  if (
    tag &&
    !["Kinh nghiệm", "Hỏi đáp", "Món mới", "Chia sẻ", "Tư vấn"].includes(tag)
  ) {
    errors.tag = "Invalid tag value";
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
  if (
    sort &&
    !["newest", "oldest", "most_liked", "most_commented"].includes(sort)
  ) {
    errors.sort =
      "Sort must be 'newest', 'oldest', 'most_liked', or 'most_commented'";
  }

  if (Object.keys(errors).length > 0) {
    return next(buildError(errors));
  }
  next();
}

// Update post status validator
export const validateUpdateStatus = [
  body("status")
    .isString()
    .isIn(["pending", "published", "hidden"])
    .withMessage("Trạng thái không hợp lệ"),
  body("moderationNote")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Ghi chú không được quá 500 ký tự"),
];

// Moderate post validator
export const validateModeratePost = [
  body("action")
    .isString()
    .isIn(["approve", "reject", "hide"])
    .withMessage("Hành động không hợp lệ"),
  body("note")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Ghi chú không được quá 500 ký tự"),
];

export default {
  validatePostId,
  validateListPosts,
  validateUpdateStatus,
  validateModeratePost,
};
