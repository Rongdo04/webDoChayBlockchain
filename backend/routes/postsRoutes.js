// routes/postsRoutes.js
import express from "express";
import * as postsController from "../controllers/postsController.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// GET /api/posts - Get community posts (public)
router.get("/", asyncHandler(postsController.getPosts));

// GET /api/posts/tags - Get available tags (public)
router.get("/tags", asyncHandler(postsController.getTags));

// POST /api/posts - Create new post (requires auth)
router.post("/", authenticate, asyncHandler(postsController.createPost));

// GET /api/posts/:id - Get single post (public)
router.get("/:id", asyncHandler(postsController.getPost));

// PUT /api/posts/:id - Update post (requires auth + ownership)
router.put("/:id", authenticate, asyncHandler(postsController.updatePost));

// DELETE /api/posts/:id - Delete post (requires auth + ownership)
router.delete("/:id", authenticate, asyncHandler(postsController.deletePost));

// POST /api/posts/:id/like - Toggle like on post (requires auth)
router.post(
  "/:id/like",
  authenticate,
  asyncHandler(postsController.toggleLike)
);

export default router;
