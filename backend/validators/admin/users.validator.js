// validators/admin/users.validator.js
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

// Validate user ID parameter
export function validateUserId(req, res, next) {
  const errors = {};
  const { id } = req.params;

  if (!id || !isValidObjectId(id)) {
    errors.id = "Invalid user ID format";
  }

  if (Object.keys(errors).length > 0) {
    return next(buildError(errors));
  }
  next();
}

// Validate list users query parameters
export function validateListUsers(req, res, next) {
  const errors = {};
  const { search, role, status, cursor, limit, sort } = req.query;

  // Validate search (optional)
  if (search && typeof search !== "string") {
    errors.search = "Search must be a string";
  }

  // Validate role
  if (role && !["admin", "user"].includes(role)) {
    errors.role = "Role must be 'admin' or 'user'";
  }

  // Validate status
  if (status && !["active", "blocked"].includes(status)) {
    errors.status = "Status must be 'active' or 'blocked'";
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

// Validate update user role request
export function validateUpdateUserRole(req, res, next) {
  const errors = {};
  const { role } = req.body;

  // Validate role
  if (!role) {
    errors.role = "Role is required";
  } else if (!["admin", "user"].includes(role)) {
    errors.role = "Role must be 'admin' or 'user'";
  }

  if (Object.keys(errors).length > 0) {
    return next(buildError(errors));
  }
  next();
}

// Validate update user status request
export function validateUpdateUserStatus(req, res, next) {
  const errors = {};
  const { status } = req.body;

  // Validate status
  if (!status) {
    errors.status = "Status is required";
  } else if (!["active", "blocked"].includes(status)) {
    errors.status = "Status must be 'active' or 'blocked'";
  }

  if (Object.keys(errors).length > 0) {
    return next(buildError(errors));
  }
  next();
}

export default {
  validateUserId,
  validateListUsers,
  validateUpdateUserRole,
  validateUpdateUserStatus,
};
