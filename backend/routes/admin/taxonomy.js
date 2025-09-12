// routes/admin/taxonomy.js
import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler.js";
import * as ctrl from "../../controllers/admin/taxonomy.controller.js";
import {
  validateCreate,
  validateUpdate,
  validateMerge,
  validateListQuery,
  validateId,
} from "../../validators/admin/taxonomy.validator.js";

const router = Router();

// Categories routes
router.get(
  "/categories",
  validateListQuery,
  asyncHandler(ctrl.categories.list)
);
router.get("/categories/stats", asyncHandler(ctrl.categories.stats));
router.get("/categories/:id", validateId, asyncHandler(ctrl.categories.getOne));
router.post(
  "/categories",
  validateCreate,
  asyncHandler(ctrl.categories.create)
);
router.put(
  "/categories/:id",
  validateId,
  validateUpdate,
  asyncHandler(ctrl.categories.update)
);
router.delete(
  "/categories/:id",
  validateId,
  asyncHandler(ctrl.categories.remove)
);

// Tags routes
router.get("/tags", validateListQuery, asyncHandler(ctrl.tags.list));
router.get("/tags/stats", asyncHandler(ctrl.tags.stats));
router.get("/tags/:id", validateId, asyncHandler(ctrl.tags.getOne));
router.post("/tags", validateCreate, asyncHandler(ctrl.tags.create));
router.put(
  "/tags/:id",
  validateId,
  validateUpdate,
  asyncHandler(ctrl.tags.update)
);
router.delete("/tags/:id", validateId, asyncHandler(ctrl.tags.remove));

// Merge route (works for both categories and tags)
router.post("/merge", validateMerge, asyncHandler(ctrl.merge));

export default router;
