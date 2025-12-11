import React from "react";
import { getErrorMessage } from "../../lib/errorMapping.js";

/**
 * Error state component with Vietnamese messages
 * @param {Object} props - Component props
 * @param {Error|number|string} props.error - Error to display
 * @param {string} props.title - Error title
 * @param {string} props.message - Custom error message
 * @param {string} props.actionLabel - Action button label
 * @param {Function} props.onAction - Action button handler
 * @param {string} props.className - Additional CSS classes
 */
export function ErrorState({
  error,
  title,
  message,
  actionLabel,
  onAction,
  className = "",
}) {
  const errorMessage =
    message || getErrorMessage(error, "Đã xảy ra lỗi không xác định");
  const errorTitle = title || "Đã xảy ra lỗi";

  return (
    <div className={`text-center py-14 px-4 ${className}`}>
      <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-700 via-rose-600 to-red-500 flex items-center justify-center text-lime-200 shadow-brand">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m0 3.75h.007v.008H12v-.008z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-emerald-900 mb-2">
        {errorTitle}
      </h3>
      <p className="text-sm text-emerald-800/80 max-w-md mx-auto mb-6">
        {errorMessage}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-brand">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Loading state component
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message
 * @param {string} props.className - Additional CSS classes
 */
export function LoadingState({ message = "Đang tải...", className = "" }) {
  return (
    <div className={`text-center py-14 px-4 ${className}`}>
      <div className="flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-emerald-800/70">{message}</span>
      </div>
    </div>
  );
}

/**
 * Empty state component
 * @param {Object} props - Component props
 * @param {string} props.title - Empty state title
 * @param {string} props.message - Empty state message
 * @param {string} props.actionLabel - Action button label
 * @param {Function} props.onAction - Action button handler
 * @param {string} props.className - Additional CSS classes
 */
export function EmptyState({
  title = "Không có dữ liệu",
  message = "Không có dữ liệu để hiển thị.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div className={`text-center py-14 px-4 ${className}`}>
      <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 flex items-center justify-center text-lime-200 shadow-brand">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M3 16.5l2.4-8.4a2.25 2.25 0 012.175-1.65h8.85a2.25 2.25 0 012.175 1.65L21 16.5M3 16.5h18M9 10.5h.008v.008H9v-.008zM15 10.5h.008v.008H15v-.008z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-emerald-900 mb-2">{title}</h3>
      <p className="text-sm text-emerald-800/80 max-w-md mx-auto mb-6">
        {message}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-brand">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Default export for backward compatibility
export default ErrorState;
