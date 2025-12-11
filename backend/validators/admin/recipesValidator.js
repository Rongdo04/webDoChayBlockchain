// validators/admin/recipesValidator.js
import { RecipeStatus } from "../../repositories/recipes.repo.js";

function buildError(details) {
  const err = new Error("Validation failed");
  err.status = 422;
  err.code = "VALIDATION_ERROR";
  err.details = details;
  return err;
}

export function validateCreate(req, res, next) {
  const errors = {};
  const { title, prepTime, cookTime } = req.body;
  if (!title || typeof title !== "string" || title.trim().length < 3) {
    errors.title = "Title required (min 3 chars)";
  }
  ["prepTime", "cookTime", "servings"].forEach((f) => {
    if (
      req.body[f] != null &&
      (isNaN(req.body[f]) || Number(req.body[f]) < 0)
    ) {
      errors[f] = "Must be a non-negative number";
    }
  });
  if (Object.keys(errors).length) return next(buildError(errors));
  next();
}

export function validateUpdate(req, res, next) {
  const errors = {};
  const allowed = [
    "title",
    "summary",
    "content",
    "ingredients",
    "steps",
    "tags",
    "category",
    "prepTime",
    "cookTime",
    "servings",
    "images",
    "slug",
    "status", // Allow status updates (draft, pending, etc.)
  ];
  const bodyKeys = Object.keys(req.body || {});
  if (!bodyKeys.length) errors.body = "No fields provided";
  bodyKeys.forEach((k) => {
    if (!allowed.includes(k)) errors[k] = "Not updatable";
  });
  if (req.body.title && req.body.title.trim().length < 3)
    errors.title = "Title min 3 chars";
  ["prepTime", "cookTime", "servings"].forEach((f) => {
    if (
      req.body[f] != null &&
      (isNaN(req.body[f]) || Number(req.body[f]) < 0)
    ) {
      errors[f] = "Must be a non-negative number";
    }
  });
  if (Object.keys(errors).length) return next(buildError(errors));
  next();
}

export function validatePublish(req, res, next) {
  if (req.body.publishAt && isNaN(Date.parse(req.body.publishAt))) {
    return next(buildError({ publishAt: "Invalid date" }));
  }
  next();
}

export function validateReject(req, res, next) {
  if (
    !req.body.reason ||
    typeof req.body.reason !== "string" ||
    req.body.reason.trim().length < 5
  ) {
    return next(buildError({ reason: "Reason required (min 5 chars)" }));
  }
  next();
}

export function validateBulk(req, res, next) {
  const { ids, action } = req.body;
  const errors = {};
  if (!Array.isArray(ids) || !ids.length) errors.ids = "ids array required";
  if (!["publish", "unpublish", "delete"].includes(action))
    errors.action = "Unsupported action";
  if (Object.keys(errors).length) return next(buildError(errors));
  next();
}

export function validateListQuery(req, res, next) {
  const { status, sort, direction, limit, page, author, dateFrom, dateTo } =
    req.query;
  const errors = {};

  // Validate status - allow "review" as alias for "pending"
  const validStatuses = [...Object.values(RecipeStatus), "review"];
  if (status && !validStatuses.includes(status))
    errors.status = "Invalid status";

  // Validate sort fields (allow database field names)
  const validSortFields = [
    "createdAt",
    "updatedAt",
    "title",
    "author",
    "rating",
    "views",
  ];
  if (sort && !validSortFields.includes(sort))
    errors.sort = "Invalid sort field";

  // Validate sort direction
  if (direction && !["asc", "desc"].includes(direction))
    errors.direction = "Invalid sort direction";

  // Validate pagination
  if (limit && (isNaN(limit) || Number(limit) < 1 || Number(limit) > 100))
    errors.limit = "limit must be between 1-100";
  if (page && (isNaN(page) || Number(page) < 1))
    errors.page = "page must be >= 1";

  // Validate author as MongoDB ObjectId format (optional)
  if (author && author.length > 0 && !/^[0-9a-fA-F]{24}$/.test(author))
    errors.author = "Invalid author ID format";

  // Validate date parameters
  if (dateFrom && isNaN(Date.parse(dateFrom)))
    errors.dateFrom = "Invalid dateFrom format";
  if (dateTo && isNaN(Date.parse(dateTo)))
    errors.dateTo = "Invalid dateTo format";

  if (Object.keys(errors).length) return next(buildError(errors));
  next();
}

export default {
  validateCreate,
  validateUpdate,
  validatePublish,
  validateReject,
  validateBulk,
  validateListQuery,
};
