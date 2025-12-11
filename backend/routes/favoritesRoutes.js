// routes/favoritesRoutes.js - User favorites API
import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/auth.js";
import * as favoritesRepo from "../repositories/favorites.repo.js";

const router = Router();

// GET /api/users/me/favorites - Get user's favorite recipes
router.get(
  "/me/favorites",
  authenticate,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 12, sort = "newest", search } = req.query;

    const filters = {
      search: search?.trim(),
    };

    // Sort options
    let sortOption = {};
    switch (sort) {
      case "rating":
        sortOption = { ratingAvg: -1, ratingCount: -1 };
        break;
      case "time":
        sortOption = { durationTotal: 1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOption,
    };

    const result = await favoritesRepo.getUserFavorites(
      req.user._id,
      filters,
      options
    );

    res.json({
      success: true,
      data: result,
    });
  })
);

// POST /api/users/me/favorites/:recipeId - Add recipe to favorites
router.post(
  "/me/favorites/:recipeId",
  authenticate,
  asyncHandler(async (req, res) => {
    const { recipeId } = req.params;

    const result = await favoritesRepo.addToFavorites(req.user._id, recipeId);

    res.json({
      success: true,
      data: result,
      message: "Đã thêm vào danh sách yêu thích",
    });
  })
);

// DELETE /api/users/me/favorites/:recipeId - Remove recipe from favorites
router.delete(
  "/me/favorites/:recipeId",
  authenticate,
  asyncHandler(async (req, res) => {
    const { recipeId } = req.params;

    const result = await favoritesRepo.removeFromFavorites(
      req.user._id,
      recipeId
    );

    res.json({
      success: true,
      data: result,
      message: "Đã xóa khỏi danh sách yêu thích",
    });
  })
);

// GET /api/users/me/favorites/:recipeId - Check if recipe is favorited
router.get(
  "/me/favorites/:recipeId",
  authenticate,
  asyncHandler(async (req, res) => {
    const { recipeId } = req.params;

    const isFavorited = await favoritesRepo.isFavorited(req.user._id, recipeId);

    res.json({
      success: true,
      data: { isFavorited },
    });
  })
);

export default router;
