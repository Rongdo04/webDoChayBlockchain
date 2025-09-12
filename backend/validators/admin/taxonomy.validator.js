// validators/admin/taxonomy.validator.js

function buildError(details) {
  const err = new Error("Validation failed");
  err.status = 422;
  err.code = "VALIDATION_ERROR";
  err.details = details;
  return err;
}

// Validate creation request
export function validateCreate(req, res, next) {
  const errors = {};
  const { name, description } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.name = "Name required (min 2 chars)";
  } else if (name.trim().length > 100) {
    errors.name = "Name too long (max 100 chars)";
  }

  if (
    description &&
    (typeof description !== "string" || description.length > 500)
  ) {
    errors.description = "Description too long (max 500 chars)";
  }

  if (
    req.body.isActive !== undefined &&
    typeof req.body.isActive !== "boolean"
  ) {
    errors.isActive = "isActive must be boolean";
  }

  if (Object.keys(errors).length) return next(buildError(errors));
  next();
}

// Validate update request
export function validateUpdate(req, res, next) {
  const errors = {};
  const allowed = ["name", "description", "isActive"];
  const bodyKeys = Object.keys(req.body || {});

  if (!bodyKeys.length) {
    errors.body = "No fields provided";
  }

  bodyKeys.forEach((key) => {
    if (!allowed.includes(key)) {
      errors[key] = "Field not updatable";
    }
  });

  const { name, description, isActive } = req.body;

  if (name !== undefined) {
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.name = "Name required (min 2 chars)";
    } else if (name.trim().length > 100) {
      errors.name = "Name too long (max 100 chars)";
    }
  }

  if (
    description !== undefined &&
    (typeof description !== "string" || description.length > 500)
  ) {
    errors.description = "Description too long (max 500 chars)";
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    errors.isActive = "isActive must be boolean";
  }

  if (Object.keys(errors).length) return next(buildError(errors));
  next();
}

// Validate merge request
export function validateMerge(req, res, next) {
  const errors = {};
  const { fromIds, toId } = req.body;

  if (!Array.isArray(fromIds) || fromIds.length === 0) {
    errors.fromIds = "fromIds array required";
  } else {
    // Validate ObjectId format
    const invalidIds = fromIds.filter((id) => !/^[0-9a-fA-F]{24}$/.test(id));
    if (invalidIds.length > 0) {
      errors.fromIds = "Invalid ID format in fromIds";
    }
  }

  if (!toId || !/^[0-9a-fA-F]{24}$/.test(toId)) {
    errors.toId = "Valid toId required";
  }

  // Check if toId is not in fromIds
  if (fromIds && fromIds.includes(toId)) {
    errors.toId = "Target ID cannot be in source IDs";
  }

  if (Object.keys(errors).length) return next(buildError(errors));
  next();
}

// Validate list query parameters
export function validateListQuery(req, res, next) {
  const errors = {};
  const { active, sort, limit } = req.query;

  if (active !== undefined && !["true", "false"].includes(active)) {
    errors.active = "active must be true or false";
  }

  if (sort && !["name", "usage", "date"].includes(sort)) {
    errors.sort = "Invalid sort option";
  }

  if (limit && (isNaN(limit) || Number(limit) < 1 || Number(limit) > 100)) {
    errors.limit = "limit must be 1-100";
  }

  if (Object.keys(errors).length) return next(buildError(errors));
  next();
}

// Validate MongoDB ObjectId
export function validateId(req, res, next) {
  const { id } = req.params;
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return next(buildError({ id: "Invalid ID format" }));
  }
  next();
}

export default {
  validateCreate,
  validateUpdate,
  validateMerge,
  validateListQuery,
  validateId,
};
