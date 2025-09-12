// routes/admin/comments.js
import express from "express";
import { asyncHandler } from "../../middleware/errorHandler.js";
import * as commentsController from "../../controllers/admin/comments.controller.js";
import * as commentsValidator from "../../validators/admin/comments.validator.js";

const router = express.Router();

// GET /api/admin/comments - List comments with filtering
router.get(
  "/",
  commentsValidator.validateListComments,
  asyncHandler(commentsController.listComments)
);

// GET /api/admin/comments/stats - Get comment statistics
router.get("/stats", asyncHandler(commentsController.getCommentStats));

// GET /api/admin/comments/:id - Get single comment
router.get(
  "/:id",
  commentsValidator.validateCommentId,
  asyncHandler(commentsController.getComment)
);

// POST /api/admin/comments/:id/approve - Approve comment
router.post(
  "/:id/approve",
  commentsValidator.validateCommentId,
  asyncHandler(commentsController.approveComment)
);

// POST /api/admin/comments/:id/hide - Hide comment
router.post(
  "/:id/hide",
  commentsValidator.validateHideComment,
  asyncHandler(commentsController.hideComment)
);

// DELETE /api/admin/comments/:id - Delete comment permanently
router.delete(
  "/:id",
  commentsValidator.validateCommentId,
  asyncHandler(commentsController.deleteComment)
);

// POST /api/admin/comments/bulk - Bulk operations
router.post(
  "/bulk",
  commentsValidator.validateBulkComments,
  asyncHandler(commentsController.bulkComments)
);

export default router;
