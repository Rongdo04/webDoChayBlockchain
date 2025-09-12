// services/postsAPI.js - API service for community posts
import api from "../lib/api";

export const postsAPI = {
  // Get community posts
  async getPosts(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add parameters
      if (params.tag) queryParams.append("tag", params.tag);
      if (params.cursor) queryParams.append("cursor", params.cursor);
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.sort) queryParams.append("sort", params.sort);

      const url = `/api/posts${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },

  // Create a new community post
  async createPost(postData) {
    try {
      const response = await api.post("/api/posts", {
        body: postData,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  // Update a post
  async updatePost(postId, postData) {
    try {
      const response = await api.put(`/api/posts/${postId}`, {
        body: postData,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  },

  // Delete a post
  async deletePost(postId) {
    try {
      const response = await api.delete(`/api/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  },

  // Like/unlike a post
  async toggleLike(postId) {
    try {
      const response = await api.post(`/api/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  },

  // Get post tags
  async getTags() {
    try {
      const response = await api.get("/api/posts/tags");
      return response.data;
    } catch (error) {
      console.error("Error fetching tags:", error);
      throw error;
    }
  },
};

export default postsAPI;
