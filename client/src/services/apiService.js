// services/apiService.js
import httpClient, { httpUtils } from "./httpClient";
import { API_ENDPOINTS, PAGINATION } from "../config";

/**
 * Generic API service with common CRUD operations
 */
class ApiService {
  constructor(baseEndpoint) {
    this.baseEndpoint = baseEndpoint;
  }

  // Get all items with optional params
  async getAll(params = {}) {
    try {
      const queryString = httpUtils.buildQueryString(params);
      const url = queryString
        ? `${this.baseEndpoint}?${queryString}`
        : this.baseEndpoint;
      return await httpClient.get(url);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  }

  // Get single item by ID
  async getById(id) {
    try {
      return await httpClient.get(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  }

  // Create new item
  async create(data) {
    try {
      return await httpClient.post(this.baseEndpoint, data);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  }

  // Update item by ID
  async update(id, data) {
    try {
      return await httpClient.put(`${this.baseEndpoint}/${id}`, data);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  }

  // Partially update item by ID
  async patch(id, data) {
    try {
      return await httpClient.patch(`${this.baseEndpoint}/${id}`, data);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  }

  // Delete item by ID
  async delete(id) {
    try {
      return await httpClient.delete(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  }
}

// Admin service with specific methods
export const adminService = {
  // Dashboard data
  getDashboardData: async () => {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.DASHBOARD);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },

  // System stats
  getSystemStats: async () => {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.STATISTICS);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },

  // Settings
  getSettings: async () => {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.SETTINGS);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },

  updateSettings: async (settings) => {
    try {
      return await httpClient.put(API_ENDPOINTS.ADMIN.SETTINGS, settings);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },
};

// File upload service
export const fileService = {
  // Upload single file
  uploadFile: async (
    file,
    endpoint = API_ENDPOINTS.UPLOAD.FILE,
    onProgress = null
  ) => {
    try {
      const formData = httpUtils.createFormData({ file });
      return await httpClient.upload(endpoint, formData, onProgress);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },

  // Upload multiple files
  uploadFiles: async (
    files,
    endpoint = "/upload/multiple",
    onProgress = null
  ) => {
    try {
      const formData = httpUtils.createFormData({ files });
      return await httpClient.upload(endpoint, formData, onProgress);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },

  // Upload avatar
  uploadAvatar: async (file, onProgress = null) => {
    try {
      const formData = httpUtils.createFormData({ file });
      return await httpClient.upload(
        API_ENDPOINTS.UPLOAD.AVATAR,
        formData,
        onProgress
      );
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },

  // Download file
  downloadFile: async (fileId, filename) => {
    try {
      return await httpClient.download(`/files/${fileId}`, filename);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },
};

// Notification service
export const notificationService = {
  // Get notifications
  getNotifications: async (params = {}) => {
    try {
      const queryString = httpUtils.buildQueryString(params);
      const url = queryString
        ? `/notifications?${queryString}`
        : "/notifications";
      return await httpClient.get(url);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },

  // Mark as read
  markAsRead: async (notificationId) => {
    try {
      return await httpClient.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      return await httpClient.patch("/notifications/read-all");
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      return await httpClient.delete(`/notifications/${notificationId}`);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },
};

// Search service
export const searchService = {
  // Global search
  search: async (query, filters = {}) => {
    try {
      const params = { q: query, ...filters };
      const queryString = httpUtils.buildQueryString(params);
      return await httpClient.get(`/search?${queryString}`);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },

  // Advanced search
  advancedSearch: async (searchParams) => {
    try {
      return await httpClient.post("/search/advanced", searchParams);
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },
};

// Health check service
export const healthService = {
  // Check API health
  checkHealth: async () => {
    try {
      return await httpClient.get("/health");
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },

  // Get system info
  getSystemInfo: async () => {
    try {
      return await httpClient.get("/system/info");
    } catch (error) {
      throw httpUtils.handleApiError(error);
    }
  },
};

// Export the main ApiService class and utilities
export { ApiService, httpUtils };

// Create user service instance
export const userService = new ApiService(API_ENDPOINTS.USERS.BASE);

export default ApiService;
