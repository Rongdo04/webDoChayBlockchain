import { useState, useCallback } from "react";
import { getErrorMessage, getSuccessMessage } from "../lib/errorMapping.js";

/**
 * Custom hook for error handling with Vietnamese messages
 * @returns {Object} Error handling utilities
 */
export function useErrorHandler() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Handle error and set error state
   * @param {Error|number|string} error - Error to handle
   * @param {string} fallback - Fallback message if no mapping found
   */
  const handleError = useCallback((error, fallback) => {
    const message = getErrorMessage(error, fallback);
    setError(message);
    console.error("Error handled:", error, "Message:", message);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Execute async function with error handling
   * @param {Function} asyncFn - Async function to execute
   * @param {Object} options - Options for execution
   * @returns {Promise} Promise that resolves with result or rejects with error
   */
  const executeWithErrorHandling = useCallback(
    async (asyncFn, options = {}) => {
      const {
        onSuccess,
        onError,
        showLoading = true,
        clearErrorOnStart = true,
      } = options;

      try {
        if (clearErrorOnStart) {
          setError(null);
        }
        if (showLoading) {
          setLoading(true);
        }

        const result = await asyncFn();

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);

        if (onError) {
          onError(err, errorMessage);
        }

        throw err;
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    []
  );

  /**
   * Get success message for action
   * @param {string} action - Action performed
   * @returns {string} Success message
   */
  const getSuccess = useCallback((action) => {
    return getSuccessMessage(action);
  }, []);

  /**
   * Get error message for error
   * @param {Error|number|string} error - Error to get message for
   * @param {string} fallback - Fallback message
   * @returns {string} Error message
   */
  const getError = useCallback((error, fallback) => {
    return getErrorMessage(error, fallback);
  }, []);

  return {
    error,
    loading,
    handleError,
    clearError,
    executeWithErrorHandling,
    getSuccess,
    getError,
  };
}

/**
 * Hook for toast notifications with error handling
 * @returns {Object} Toast utilities
 */
export function useToast() {
  const [toast, setToast] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    error: null,
    action: null,
  });

  /**
   * Show success toast
   * @param {string} message - Success message
   * @param {string} action - Action performed
   * @param {string} title - Toast title
   */
  const showSuccess = useCallback((message, action, title = "Thành công") => {
    setToast({
      open: true,
      type: "success",
      title,
      message: message || getSuccessMessage(action),
      action,
    });
  }, []);

  /**
   * Show error toast
   * @param {Error|number|string} error - Error to show
   * @param {string} title - Toast title
   * @param {string} fallback - Fallback message
   */
  const showError = useCallback((error, title = "Lỗi", fallback) => {
    setToast({
      open: true,
      type: "error",
      title,
      error,
      message: getErrorMessage(error, fallback),
    });
  }, []);

  /**
   * Show info toast
   * @param {string} message - Info message
   * @param {string} title - Toast title
   */
  const showInfo = useCallback((message, title = "Thông báo") => {
    setToast({
      open: true,
      type: "info",
      title,
      message,
    });
  }, []);

  /**
   * Close toast
   */
  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    toast,
    showSuccess,
    showError,
    showInfo,
    closeToast,
  };
}
