/**
 * Toast (UI-only)
 * Props: { open, type?: 'success'|'error'|'info', title?, message, onClose }
 * Story:
 *  <Toast open type="success" title="Saved" message="Item saved" onClose={()=>{}} />
 */
import React, { useEffect } from "react";
import { FaCheck, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import { t } from "../../i18n";

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
  autoHide = 3000,
  onClose,
}) {
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
            <div className="leading-snug">{message}</div>
          </div>
          <button
            aria-label={t("common.close", "Close notification")}
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
