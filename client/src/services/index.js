// services/index.js
// Export all services
export { default as authAPI } from "./authAPI";
export { default as httpClient, httpUtils, apiEndpoints } from "./httpClient";
export {
  default as ApiService,
  userService,
  adminService,
  fileService,
  notificationService,
  searchService,
  healthService,
} from "./apiService";

// Re-export commonly used utilities
export { httpUtils as apiUtils };

// Service factory for creating new API services
export const createApiService = (baseEndpoint) => {
  return new ApiService(baseEndpoint);
};
