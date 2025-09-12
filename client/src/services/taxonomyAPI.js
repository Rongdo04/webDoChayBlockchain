// services/taxonomyAPI.js - Public taxonomy API service
import { api } from "../lib/api.js";

export const taxonomyAPI = {
  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get("/api/taxonomy/categories");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  // Get all tags
  getTags: async (limit = 50) => {
    try {
      const response = await api.get("/api/taxonomy/tags", {
        params: { limit },
      });
      return response.data || [];
    } catch (error) {
      console.error("Error fetching tags:", error);
      throw error;
    }
  },

  // Search suggestions
  getSuggestions: async (query) => {
    try {
      const response = await api.get("/api/taxonomy/suggest", {
        params: { q: query },
      });
      return response;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      throw error;
    }
  },
};

export default taxonomyAPI;
