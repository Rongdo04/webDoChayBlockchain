// hooks/useReporting.js
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import reportsAPI from "../services/reportsAPI";

/**
 * Custom hook for handling reporting functionality
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback when report is successfully submitted
 * @param {Function} options.onLoginRequired - Callback when user needs to login
 * @returns {Object} - Hook state and functions
 */
export function useReporting({ onSuccess, onLoginRequired } = {}) {
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Submit a report
   * @param {Object} reportData - The report data
   * @param {string} reportData.targetType - Type of target ('recipe' | 'comment' | 'post')
   * @param {string} reportData.targetId - ID of the target being reported
   * @param {string} reportData.reason - Reason for the report
   * @param {string} [reportData.description] - Additional description
   */
  const submitReport = async (reportData) => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return { success: false, error: "Authentication required" };
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await reportsAPI.submitReport(reportData);

      onSuccess?.({
        reportData,
        response,
        message: response?.data?.message || "Báo cáo đã được gửi thành công",
      });

      return { success: true, data: response };
    } catch (error) {
      console.error("Error submitting report:", error);
      const errorMessage =
        error.message || "Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Check if user can report (is authenticated)
   * @returns {boolean}
   */
  const canReport = () => {
    return isAuthenticated;
  };

  /**
   * Handle report action with authentication check
   * @param {Object} target - The target to report
   * @param {Function} onProceed - Callback when user is authenticated
   */
  const handleReport = (target, onProceed) => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }
    onProceed?.(target);
  };

  /**
   * Reset error state
   */
  const clearError = () => {
    setError(null);
  };

  return {
    isSubmitting,
    error,
    canReport,
    submitReport,
    handleReport,
    clearError,
  };
}

export default useReporting;
