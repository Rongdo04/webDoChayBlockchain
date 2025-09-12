// hooks/useReportModal.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hook for managing report modal state and navigation
 * @param {Object} options - Configuration options
 * @param {Function} options.onReportSuccess - Callback when report is successfully submitted
 * @returns {Object} - Hook state and functions
 */
export function useReportModal({ onReportSuccess } = {}) {
  const navigate = useNavigate();
  const [reportTarget, setReportTarget] = useState(null);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [toast, setToast] = useState(null);

  /**
   * Handle report action - checks authentication and opens appropriate modal
   * @param {Object} target - The target to report
   * @param {boolean} isAuthenticated - Whether user is authenticated
   */
  const handleReport = (target, isAuthenticated) => {
    if (!isAuthenticated) {
      setShowLoginRequired(true);
      return;
    }
    setReportTarget(target);
  };

  /**
   * Handle successful report submission
   * @param {Object} result - Report submission result
   */
  const handleReportSuccess = (result) => {
    setReportTarget(null);
    setToast(result.message || "Đã gửi báo cáo. Cảm ơn bạn!");
    onReportSuccess?.(result);
  };

  /**
   * Handle report submission error
   * @param {Object} error - Error object
   */
  const handleReportError = (error) => {
    setToast(
      error?.message || error || "Gửi báo cáo thất bại. Vui lòng thử lại!"
    );
  };

  /**
   * Handle login redirect from login required modal
   */
  const handleLoginRedirect = () => {
    const currentPath = window.location.pathname;
    const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    navigate(redirectUrl);
    setShowLoginRequired(false);
  };

  /**
   * Close report modal
   */
  const closeReportModal = () => {
    setReportTarget(null);
  };

  /**
   * Close login required modal
   */
  const closeLoginModal = () => {
    setShowLoginRequired(false);
  };

  /**
   * Clear toast message
   */
  const clearToast = () => {
    setToast(null);
  };

  return {
    // State
    reportTarget,
    showLoginRequired,
    toast,

    // Actions
    handleReport,
    handleReportSuccess,
    handleReportError,
    handleLoginRedirect,
    closeReportModal,
    closeLoginModal,
    clearToast,
  };
}

export default useReportModal;
