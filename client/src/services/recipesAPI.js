// services/recipesAPI.js - Public recipes API service
import { api } from "../lib/api.js";

export const recipesAPI = {
  // Get trending/featured recipes
  getTrending: async (options = {}) => {
    const { limit = 8, sort = "rating" } = options;

    try {
      const response = await api.get("/api/recipes", {
        params: {
          sort,
          limit,
          page: 1,
        },
      });
      return response.data || [];
    } catch (error) {
      console.error("Error fetching trending recipes:", error);
      throw error;
    }
  },

  // Get recipes with filters and pagination
  getRecipes: async (options = {}) => {
    const {
      page = 1,
      limit = 12,
      sort = "newest",
      category,
      search,
      difficulty,
      dietType,
      tags,
    } = options;

    try {
      const params = {
        page,
        limit,
        sort,
      };

      if (category) params.category = category;
      if (search) params.search = search;
      if (difficulty) params.difficulty = difficulty;
      if (dietType) params.dietType = dietType;
      if (tags) params.tags = tags;

      const response = await api.get("/api/recipes", { params });
      return response;
    } catch (error) {
      console.error("Error fetching recipes:", error);
      throw error;
    }
  },

  // Get single recipe by ID
  getRecipeById: async (id) => {
    try {
      const response = await api.get(`/api/recipes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching recipe by ID:", error);
      throw error;
    }
  },

  // Get single recipe by slug
  getRecipeBySlug: async (slug) => {
    try {
      const response = await api.get(
        `/api/recipes/slug/${encodeURIComponent(slug)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching recipe by slug:", error);
      throw error;
    }
  },

  // Create a new recipe (submit)
  createRecipe: async (recipeData) => {
    try {
      const response = await api.post("/api/recipes", { body: recipeData });
      return response;
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    }
  },

  // Update recipe
  updateRecipe: async (id, recipeData) => {
    try {
      const response = await api.put(`/api/recipes/${id}`, {
        body: recipeData,
      });
      return response;
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw error;
    }
  },

  // Delete recipe
  deleteRecipe: async (id) => {
    try {
      const response = await api.delete(`/api/recipes/${id}`);
      return response;
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  },
};

export default recipesAPI;
