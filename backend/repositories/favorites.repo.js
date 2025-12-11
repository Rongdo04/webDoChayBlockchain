// repositories/favorites.repo.js
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import mongoose from "mongoose";

/**
 * Get user's favorite recipes with pagination and filtering
 */
export async function getUserFavorites(userId, filters = {}, options = {}) {
  try {
    const user = await User.findById(userId).populate({
      path: "favorites",
      match: { status: "published" }, // Only published recipes
      options: {
        sort: options.sort || { createdAt: -1 },
        limit: options.limit || 12,
        skip: ((options.page || 1) - 1) * (options.limit || 12),
      },
    });

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    let recipes = user.favorites || [];

    // Apply search filter
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      recipes = recipes.filter(
        (recipe) =>
          recipe.title.match(searchRegex) ||
          (recipe.summary && recipe.summary.match(searchRegex)) ||
          (recipe.description && recipe.description.match(searchRegex))
      );
    }

    // Get total count for pagination
    const totalCount = await Recipe.countDocuments({
      _id: { $in: user.favorites },
      status: "published",
    });

    return {
      recipes,
      total: totalCount,
      page: options.page || 1,
      limit: options.limit || 12,
      totalPages: Math.ceil(totalCount / (options.limit || 12)),
    };
  } catch (error) {
    console.error("Get user favorites repository error:", error);
    throw error;
  }
}

/**
 * Add recipe to user's favorites
 */
export async function addToFavorites(userId, recipeId) {
  try {
    // Check if recipe exists and is published
    const recipe = await Recipe.findOne({
      _id: recipeId,
      status: "published",
    });

    if (!recipe) {
      const error = new Error("Recipe not found or not published");
      error.status = 404;
      error.code = "RECIPE_NOT_FOUND";
      throw error;
    }

    // Add to user's favorites if not already there
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    if (!user.favorites.includes(recipeId)) {
      user.favorites.push(recipeId);
      await user.save();
    }

    return {
      isFavorited: true,
      favoritesCount: user.favorites.length,
    };
  } catch (error) {
    console.error("Add to favorites repository error:", error);
    throw error;
  }
}

/**
 * Remove recipe from user's favorites
 */
export async function removeFromFavorites(userId, recipeId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    // Remove from favorites
    user.favorites = user.favorites.filter(
      (id) => id.toString() !== recipeId.toString()
    );
    await user.save();

    return {
      isFavorited: false,
      favoritesCount: user.favorites.length,
    };
  } catch (error) {
    console.error("Remove from favorites repository error:", error);
    throw error;
  }
}

/**
 * Check if recipe is favorited by user
 */
export async function isFavorited(userId, recipeId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    return user.favorites.includes(recipeId);
  } catch (error) {
    console.error("Check favorited repository error:", error);
    throw error;
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(userId, recipeId) {
  try {
    const isFavorited = await isFavorited(userId, recipeId);

    if (isFavorited) {
      return await removeFromFavorites(userId, recipeId);
    } else {
      return await addToFavorites(userId, recipeId);
    }
  } catch (error) {
    console.error("Toggle favorite repository error:", error);
    throw error;
  }
}
