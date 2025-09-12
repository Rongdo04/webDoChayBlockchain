import React, { createContext, useContext, useCallback } from "react";
import { api } from "../../lib/api.js";
import { HttpError } from "../../lib/httpError.js";

const AdminApiContext = createContext(null);

/**
 * Admin API Provider - Cung cấp API client và error handling cho admin
 */
export function AdminApiProvider({ children }) {
  // Admin-specific API methods
  const adminApi = {
    // Metrics endpoints
    getMetricsOverview: useCallback(
      () => api.get("/api/admin/metrics/overview"),
      []
    ),

    getMetricsSummary: useCallback(
      (params = {}) => api.get("/api/admin/metrics/summary", { params }),
      []
    ),

    getActivityFeed: useCallback(
      (params = {}) => api.get("/api/admin/activity", { params }),
      []
    ),

    // Audit endpoints
    getAuditLogs: useCallback(
      (params = {}) => api.get("/api/admin/audit-logs", { params }),
      []
    ),

    // User management
    getUsers: useCallback(
      (params = {}) => api.get("/api/admin/users", { params }),
      []
    ),

    getUserById: useCallback((id) => api.get(`/api/admin/users/${id}`), []),

    updateUser: useCallback(
      (id, data) => api.put(`/api/admin/users/${id}`, { body: data }),
      []
    ),

    deleteUser: useCallback((id) => api.delete(`/api/admin/users/${id}`), []),

    // User role and status management
    updateUserRole: useCallback(
      (id, role) => api.put(`/api/admin/users/${id}/role`, { body: { role } }),
      []
    ),

    updateUserStatus: useCallback(
      (id, status) =>
        api.put(`/api/admin/users/${id}/status`, { body: { status } }),
      []
    ),

    // Recipe management
    getRecipes: useCallback(
      (params = {}) => api.get("/api/admin/recipes", { params }),
      []
    ),

    getRecipeById: useCallback((id) => api.get(`/api/admin/recipes/${id}`), []),

    createRecipe: useCallback(
      (data) => api.post("/api/admin/recipes", { body: data }),
      []
    ),

    updateRecipe: useCallback(
      (id, data) => api.put(`/api/admin/recipes/${id}`, { body: data }),
      []
    ),

    deleteRecipe: useCallback(
      (id) => api.delete(`/api/admin/recipes/${id}`),
      []
    ),

    publishRecipe: useCallback(
      (id, publishAt = null) =>
        api.post(`/api/admin/recipes/${id}/publish`, {
          body: publishAt ? { publishAt } : {},
        }),
      []
    ),

    unpublishRecipe: useCallback(
      (id) => api.post(`/api/admin/recipes/${id}/unpublish`),
      []
    ),

    rejectRecipe: useCallback(
      (id, reason) =>
        api.post(`/api/admin/recipes/${id}/reject`, { body: { reason } }),
      []
    ),

    bulkUpdateRecipes: useCallback(
      (data) =>
        api.post("/api/admin/recipes/bulk", {
          body: { ...data, action: data.action || "publish" },
        }),
      []
    ),

    bulkDeleteRecipes: useCallback(
      (data) =>
        api.post("/api/admin/recipes/bulk", {
          body: { ...data, action: "delete" },
        }),
      []
    ),

    bulkRecipes: useCallback(
      (data) => api.post("/api/admin/recipes/bulk", { body: data }),
      []
    ),

    approveRecipe: useCallback(
      (id) => api.post(`/api/admin/recipes/${id}/approve`),
      []
    ),

    // Comment management
    getComments: useCallback(
      (params = {}) => api.get("/api/admin/comments", { params }),
      []
    ),

    approveComment: useCallback(
      (id) => api.post(`/api/admin/comments/${id}/approve`),
      []
    ),

    hideComment: useCallback(
      (id) => api.post(`/api/admin/comments/${id}/hide`),
      []
    ),

    deleteComment: useCallback(
      (id) => api.delete(`/api/admin/comments/${id}`),
      []
    ),

    bulkComments: useCallback(
      (data) => api.post("/api/admin/comments/bulk", { body: data }),
      []
    ),

    // Media
    getMedia: useCallback(
      (params = {}) => api.get("/api/admin/media", { params }),
      []
    ),

    getMediaById: useCallback((id) => api.get(`/api/admin/media/${id}`), []),

    uploadMedia: useCallback(
      (formData) =>
        api.post("/api/admin/media", {
          body: formData,
          // Don't set headers for FormData - let browser handle it
        }),
      []
    ),

    presignMedia: useCallback(
      (data) => api.post("/api/admin/media/presign", { body: data }),
      []
    ),

    confirmMediaUpload: useCallback(
      (data) => api.post("/api/admin/media/confirm", { body: data }),
      []
    ),

    updateMedia: useCallback(
      (id, data) => api.put(`/api/admin/media/${id}`, { body: data }),
      []
    ),

    deleteMedia: useCallback((id) => api.delete(`/api/admin/media/${id}`), []),

    bulkDeleteMedia: useCallback(
      (ids) => api.post("/api/admin/media/bulk/delete", { body: { ids } }),
      []
    ),

    // Taxonomy (Categories & Tags)
    getCategories: useCallback(
      (params = {}) => api.get("/api/admin/taxonomy/categories", { params }),
      []
    ),

    createCategory: useCallback(
      (data) => api.post("/api/admin/taxonomy/categories", { body: data }),
      []
    ),

    updateCategory: useCallback(
      (id, data) =>
        api.put(`/api/admin/taxonomy/categories/${id}`, { body: data }),
      []
    ),

    deleteCategory: useCallback(
      (id) => api.delete(`/api/admin/taxonomy/categories/${id}`),
      []
    ),

    getTags: useCallback(
      (params = {}) => api.get("/api/admin/taxonomy/tags", { params }),
      []
    ),

    createTag: useCallback(
      (data) => api.post("/api/admin/taxonomy/tags", { body: data }),
      []
    ),

    updateTag: useCallback(
      (id, data) => api.put(`/api/admin/taxonomy/tags/${id}`, { body: data }),
      []
    ),

    deleteTag: useCallback(
      (id) => api.delete(`/api/admin/taxonomy/tags/${id}`),
      []
    ),

    // Public taxonomy suggestions
    suggestTaxonomy: useCallback(
      (q) => api.get("/api/taxonomy/suggest", { params: { q } }),
      []
    ),

    // Settings
    getSettings: useCallback(() => api.get("/api/admin/settings"), []),

    updateSettings: useCallback(
      (data) => api.put("/api/admin/settings", { body: data }),
      []
    ),

    // Reports management
    getReports: useCallback(
      (params = {}) => api.get("/api/admin/reports", { params }),
      []
    ),

    getReportById: useCallback((id) => api.get(`/api/admin/reports/${id}`), []),

    updateReportStatus: useCallback(
      (id, status, notes = "") =>
        api.put(`/api/admin/reports/${id}/status`, {
          body: { status, notes },
        }),
      []
    ),

    deleteReport: useCallback(
      (id) => api.delete(`/api/admin/reports/${id}`),
      []
    ),

    getReportsStats: useCallback(() => api.get("/api/admin/reports/stats"), []),
  };

  // Enhanced error handler for admin context
  const handleApiError = useCallback(
    (error, defaultMessage = "Đã xảy ra lỗi") => {
      if (error instanceof HttpError) {
        // Return localized error message
        return {
          message: error.getLocalizedMessage(),
          code: error.code,
          status: error.status,
          isAuthError: error.isAuthError(),
          isForbidden: error.status === 403,
          details: error.details,
        };
      }

      // Network or other errors
      return {
        message: defaultMessage,
        code: "UNKNOWN_ERROR",
        status: null,
        isAuthError: false,
        isForbidden: false,
        details: error?.message,
      };
    },
    []
  );

  // Safe API call wrapper with error handling
  const safeApiCall = useCallback(
    async (apiCall, options = {}) => {
      const {
        onSuccess,
        onError,
        defaultErrorMessage = "Đã xảy ra lỗi",
        showToast = true,
      } = options;

      try {
        const result = await apiCall();

        if (onSuccess) {
          onSuccess(result);
        }

        return { success: true, data: result, error: null };
      } catch (error) {
        const errorInfo = handleApiError(error, defaultErrorMessage);

        if (onError) {
          onError(errorInfo);
        }

        // Log error for debugging in dev
        if (import.meta.env.DEV) {
          console.error("Admin API Error:", error);
        }

        return { success: false, data: null, error: errorInfo };
      }
    },
    [handleApiError]
  );

  const contextValue = {
    // Direct API methods
    ...adminApi,

    // Utility methods
    handleApiError,
    safeApiCall,

    // Common patterns
    fetchWithErrorHandling: safeApiCall,
  };

  return (
    <AdminApiContext.Provider value={contextValue}>
      {children}
    </AdminApiContext.Provider>
  );
}

/**
 * Hook to use admin API context
 */
export function useAdminApi() {
  const context = useContext(AdminApiContext);

  if (!context) {
    throw new Error("useAdminApi must be used within an AdminApiProvider");
  }

  return context;
}

export default AdminApiContext;
