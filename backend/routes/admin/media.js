// routes/admin/media.js
import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler.js";
import ctrl from "../../controllers/admin/mediaController.js";
import {
  validateUpload,
  validatePresign,
  validateConfirm,
  validateUpdate,
  validateListQuery,
  validateBulkDelete,
  validateBulkUpdateTags,
} from "../../validators/admin/mediaValidator.js";

const router = Router();

// List media with filtering and pagination
router.get("/", validateListQuery, asyncHandler(ctrl.list));

// Get single media item
router.get("/stats", asyncHandler(ctrl.stats));
router.get("/cleanup", asyncHandler(ctrl.cleanup));
router.get("/:id", asyncHandler(ctrl.getOne));

// Upload endpoints
router.post(
  "/",
  ctrl.uploadMiddleware,
  validateUpload,
  asyncHandler(ctrl.uploadFile)
);
router.post("/presign", validatePresign, asyncHandler(ctrl.presign));
router.post("/confirm", validateConfirm, asyncHandler(ctrl.confirm));

// Bulk operations
router.post("/bulk/delete", validateBulkDelete, asyncHandler(ctrl.bulkDelete));
router.post(
  "/bulk/tags",
  validateBulkUpdateTags,
  asyncHandler(ctrl.bulkUpdateTags)
);

// Update and delete
router.put("/:id", validateUpdate, asyncHandler(ctrl.update));
router.delete("/:id", asyncHandler(ctrl.remove));

export default router;
