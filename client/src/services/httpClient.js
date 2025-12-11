// services/httpClient.js
import axios from "axios";
import { config, HTTP_STATUS, ERROR_MESSAGES } from "../config";

// API Configuration
const API_CONFIG = {
  baseURL: config.API.BASE_URL,
  timeout: config.API.TIMEOUT,
  withCredentials: true, // Gửi cookies với mỗi request
  headers: {
    "Content-Type": "application/json",
  },
};

// Create axios instance
const httpClient = axios.create(API_CONFIG);

// Request interceptor - Log requests
httpClient.interceptors.request.use(
  (config) => {
    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        ` ${config.method?.toUpperCase()} ${config.url}`,
        config.data
      );
    }

    // Simple burst detection heuristic (debug only)
    if (!window.__reqTimes) window.__reqTimes = [];
    const now = Date.now();
    window.__reqTimes.push(now);
    window.__reqTimes = window.__reqTimes.filter((t) => now - t < 2000);
    if (window.__reqTimes.length > 8) {
      console.warn(
        "⚠️ Phát hiện nhiều request trong 2s — kiểm tra vòng lặp logic auth hoặc re-render."
      );
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
httpClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (config.isDevelopment() && config.DEBUG.ENABLE_LOGGING) {
      console.log(
        `✓ ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data
      );
    }

    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED:
          // Unauthorized - token expired or invalid
          // Token được xử lý tự động bởi HTTP-only cookies
          // Bạn có thể xử lý chuyển trang ở nơi khác nếu muốn
          break;

        case HTTP_STATUS.FORBIDDEN:
          // Forbidden - user doesn't have permission
          console.error("❌ Access denied: Insufficient permissions");
          break;

        case HTTP_STATUS.NOT_FOUND:
          // Not found
          console.error("❌ Resource not found");
          break;

        case HTTP_STATUS.UNPROCESSABLE_ENTITY:
          // Validation error
          console.error("❌ Validation error:", data.errors);
          break;

        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          // Server error
          console.error("❌ Server error - please try again later");
          break;

        default:
          console.error(`❌ HTTP Error ${status}:`, data.message);
      }

      // Log error details in development
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Response Error:", {
          status,
          statusText: error.response.statusText,
          data,
          config: error.config,
        });
      }
    } else if (error.request) {
      // Network error
      console.error("❌ Network Error: Please check your internet connection");
    } else {
      // Something else went wrong
      console.error("❌ Unexpected Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// HTTP Client Methods
const httpMethods = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await httpClient.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await httpClient.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await httpClient.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await httpClient.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await httpClient.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload file
  upload: async (url, formData, onUploadProgress = null) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      };

      const response = await httpClient.post(url, formData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download file
  download: async (url, filename = "download") => {
    try {
      const response = await httpClient.get(url, {
        responseType: "blob",
      });

      // Create download link
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Utility functions
export const httpUtils = {
  // Check if user is authenticated (sẽ được xử lý bởi backend qua cookie)
  isAuthenticated: () => {
    // Không thể check từ client side với HTTP-only cookies
    // Authentication status sẽ được xác định bởi server
    return true; // Tạm thời trả về true, sẽ được kiểm tra qua API calls
  },

  // Clear all auth data
  clearAuthData: () => {
    // Không cần xóa gì vì token được lưu trong HTTP-only cookie
    // và user data được quản lý bởi React state
  },

  // Build query string
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      if (
        params[key] !== null &&
        params[key] !== undefined &&
        params[key] !== ""
      ) {
        if (Array.isArray(params[key])) {
          params[key].forEach((value) => searchParams.append(key, value));
        } else {
          searchParams.append(key, params[key]);
        }
      }
    });

    return searchParams.toString();
  },

  // Create form data
  createFormData: (data) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        if (data[key] instanceof File) {
          formData.append(key, data[key]);
        } else if (Array.isArray(data[key])) {
          data[key].forEach((item) => formData.append(key, item));
        } else if (typeof data[key] === "object") {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    return formData;
  },

  // Handle API errors
  handleApiError: (error) => {
    let message = "Có lỗi xảy ra. Vui lòng thử lại.";

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    return {
      message,
      status: error.response?.status,
      errors: error.response?.data?.errors || {},
    };
  },

  // Retry failed requests
  retry: async (fn, retries = 3, delay = 1000) => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && error.response?.status >= 500) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return httpUtils.retry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  },
};

// API Endpoints
export const apiEndpoints = {
  // Authentication
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    profile: "/auth/profile",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    changePassword: "/auth/change-password",
    verifyEmail: "/auth/verify-email",
    refreshToken: "/auth/refresh-token",
  },

  // Users
  users: {
    list: "/auth/users",
    create: "/auth/users",
    update: (id) => `/auth/users/${id}`,
    delete: (id) => `/auth/users/${id}`,
    updateStatus: (id) => `/auth/users/${id}/status`,
    updateRole: (id) => `/auth/users/${id}/role`,
  },

  // Admin
  admin: {
    stats: "/auth/stats",
    dashboard: "/admin/dashboard",
    settings: "/admin/settings",
  },

  // Other endpoints can be added here...
};

// Export the main http client and methods
export { httpClient };
export default httpMethods;
