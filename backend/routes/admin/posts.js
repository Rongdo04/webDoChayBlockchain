// routes/admin/posts.js
import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler.js";
import * as postsController from "../../controllers/admin/posts.controller.js";
import {
  validatePostId,
  validateListPosts,
  validateUpdateStatus,
  validateModeratePost,
} from "../../validators/admin/posts.validator.js";

const router = Router();

// GET /api/admin/posts - List posts with filtering and pagination
router.get("/", validateListPosts, asyncHandler(postsController.listPosts));

// GET /api/admin/posts/stats - Get post statistics
router.get("/stats", asyncHandler(postsController.getPostStats));

// GET /api/admin/posts/:id - Get single post details
router.get("/:id", validatePostId, asyncHandler(postsController.getPost));

// PUT /api/admin/posts/:id/status - Update post status
router.put(
  "/:id/status",
  validatePostId,
  validateUpdateStatus,
  asyncHandler(postsController.updatePostStatus)
);

// POST /api/admin/posts/:id/moderate - Moderate a post
router.post(
  "/:id/moderate",
  validatePostId,
  validateModeratePost,
  asyncHandler(postsController.moderatePost)
);

// DELETE /api/admin/posts/:id - Delete a post
router.delete("/:id", validatePostId, asyncHandler(postsController.deletePost));

export default router;
