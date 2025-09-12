/**
 * ConfirmModal (UI-only)
 * Props: { open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }
 * Story:
 *  <ConfirmModal open title="Delete" message="Are you sure?" onConfirm={()=>{}} onCancel={()=>{}} />
 */
import React, { useEffect } from "react";
import { t } from "../../i18n";

export default function ConfirmModal({
  open,
  title = t("actions.confirm", "Confirm"),
  message = t("confirm.message", "Bạn có chắc chắn?"),
  confirmLabel = t("actions.confirm", "Confirm"),
  cancelLabel = t("actions.cancel", "Cancel"),
  onConfirm,
  onCancel,
  danger = false,
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && open) onCancel && onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onCancel && onCancel()}
      ></div>
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-[scaleIn_.18s_ease] focus:outline-none"
        tabIndex={-1}
      >
        <h3
          id="confirm-title"
          className="text-lg font-semibold text-emerald-900 mb-2"
        >
          {title}
        </h3>
        <p className="text-sm text-emerald-800/80 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => onCancel && onCancel()}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-emerald-900/15 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => onConfirm && onConfirm()}
            className={`px-4 py-2 rounded-xl text-sm font-medium text-white shadow-brand focus:outline-none focus:ring-2 focus:ring-lime-400 ${
              danger
                ? "bg-gradient-to-br from-rose-700 via-rose-600 to-rose-500"
                : "bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
