// services/authAPI.js
import httpClient, { httpUtils, apiEndpoints } from "./httpClient";
import { API_ENDPOINTS } from "../config";

const authAPI = {
  // Authentication endpoints
  login: async (credentials) => {
    try {
      const response = await httpClient.post(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Token được lưu tự động trong HTTP-only cookie
      return response;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await httpClient.post(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );

      // Token được lưu tự động trong HTTP-only cookie
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      httpUtils.clearAuthData();
    } catch (error) {
      // Clear auth data even if logout request fails
      httpUtils.clearAuthData();
      throw error;
    }
  },

  // Profile endpoints
  getProfile: async () => {
    try {
      const response = await httpClient.get(API_ENDPOINTS.USERS.PROFILE);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await httpClient.put(
        API_ENDPOINTS.USERS.UPDATE_PROFILE,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Password endpoints
  changePassword: async (passwords) => {
    try {
      const response = await httpClient.put(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        passwords
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await httpClient.post(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await httpClient.post(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        {
          token,
          password,
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin endpoints
  getAllUsers: async (params = {}) => {
    try {
      const queryString = httpUtils.buildQueryString(params);
      const url = queryString
        ? `${API_ENDPOINTS.ADMIN.USERS}?${queryString}`
        : API_ENDPOINTS.ADMIN.USERS;
      const response = await httpClient.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await httpClient.get(API_ENDPOINTS.ADMIN.STATISTICS);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await httpClient.put(
        `${API_ENDPOINTS.ADMIN.USERS}/${userId}/status`,
        {
          isActive,
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await httpClient.delete(
        `${API_ENDPOINTS.ADMIN.USERS}/${userId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateUserRole: async (userId, role) => {
    try {
      const response = await httpClient.put(
        `${API_ENDPOINTS.ADMIN.USERS}/${userId}/role`,
        {
          role,
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Utility functions
  isAuthenticated: httpUtils.isAuthenticated,
  clearAuthData: httpUtils.clearAuthData,
  handleApiError: httpUtils.handleApiError,
};

export default authAPI;
