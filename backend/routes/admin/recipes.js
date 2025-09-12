// routes/admin/recipes.js
import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler.js";
import * as ctrl from "../../controllers/admin/recipesController.js";
import {
  validateCreate,
  validateUpdate,
  validatePublish,
  validateReject,
  validateBulk,
  validateListQuery,
} from "../../validators/admin/recipesValidator.js";

const router = Router();

router.get("/", validateListQuery, asyncHandler(ctrl.list));
router.get("/:id", asyncHandler(ctrl.getOne));
router.post("/", validateCreate, asyncHandler(ctrl.create));
router.put("/:id", validateUpdate, asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove));
router.post("/:id/publish", validatePublish, asyncHandler(ctrl.publish));
router.post("/:id/unpublish", asyncHandler(ctrl.unpublish));
router.post("/:id/reject", validateReject, asyncHandler(ctrl.reject));
router.post("/bulk", validateBulk, asyncHandler(ctrl.bulk));

export default router;
