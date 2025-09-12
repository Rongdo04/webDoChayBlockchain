// commentsAPI.js - API service for comments
import api from "../lib/api";

export const commentsAPI = {
  // Get comments for a recipe
  async getComments(recipeId, params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add parameters
      if (params.status) queryParams.append("status", params.status);
      if (params.cursor) queryParams.append("cursor", params.cursor);
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.page) queryParams.append("page", params.page.toString());

      const url = `/api/recipes/${recipeId}/comments${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);
      return response; // Return full response instead of just response.data
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  // Add a comment to a recipe
  async addComment(recipeId, content, rating = null) {
    try {
      const payload = { content };
      if (rating && rating >= 1 && rating <= 5) {
        payload.rating = rating;
      }

      const response = await api.post(`/api/recipes/${recipeId}/comments`, {
        body: payload,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  },

  // Update a comment
  async updateComment(commentId, content) {
    try {
      const response = await api.put(`/comments/${commentId}`, {
        content,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  },

  // Delete a comment
  async deleteComment(commentId) {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  // Get comments by user
  async getUserComments(userId) {
    try {
      const response = await api.get(`/users/${userId}/comments`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user comments:", error);
      throw error;
    }
  },
};
