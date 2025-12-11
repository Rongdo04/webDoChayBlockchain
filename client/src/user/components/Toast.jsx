/**
 * Toast (UI-only)
 * Props: { open, type?: 'success'|'error'|'info', title?, message, onClose }
 * Story:
 *  <Toast open type="success" title="Saved" message="Item saved" onClose={()=>{}} />
 */
import React, { useEffect } from "react";
import { FaCheck, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import { getErrorMessage, getSuccessMessage } from "../../lib/errorMapping.js";

const typeStyle = {
  success: "bg-emerald-600",
  error: "bg-rose-600",
  info: "bg-emerald-900",
};

export default function Toast({
  open,
  type = "info",
  title,
  message,
  error, // New prop to pass error object
  action, // New prop to specify action for success messages
  autoHide = 3000,
  onClose,
}) {
  // Process message based on type and props
  const processedMessage = React.useMemo(() => {
    if (message) return message;

    if (type === "error" && error) {
      return getErrorMessage(error);
    }

    if (type === "success" && action) {
      return getSuccessMessage(action);
    }

    return message || "Thông báo";
  }, [message, type, error, action]);
  useEffect(() => {
    if (!open || !autoHide) return;
    const t = setTimeout(() => onClose && onClose(), autoHide);
    return () => clearTimeout(t);
  }, [open, autoHide, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed z-50 bottom-4 right-4 max-w-sm transition-all ${
        open
          ? "opacity-100 translate-y-0"
          : "opacity-0 pointer-events-none translate-y-2"
      }`}
    >
      <div
        className={`rounded-xl shadow-lg text-white overflow-hidden ${typeStyle[type]}`}
      >
        <div className="flex items-start gap-3 px-4 py-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            {type === "success" && <FaCheck className="w-4 h-4" />}
            {type === "error" && <FaExclamationCircle className="w-4 h-4" />}
            {type === "info" && <FaInfoCircle className="w-4 h-4" />}
          </div>
          <div className="text-sm">
            {title && <div className="font-semibold mb-0.5">{title}</div>}
            <div className="leading-snug">{processedMessage}</div>
          </div>
          <button
            aria-label="Đóng thông báo"
            onClick={() => onClose && onClose()}
            className="ml-auto text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
