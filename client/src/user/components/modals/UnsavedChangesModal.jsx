import React, { useEffect, useRef } from "react";

export default function UnsavedChangesModal({ open, onCancel, onConfirm }) {
  const dialogRef = useRef();
  const firstBtn = useRef();

  useEffect(() => {
    if (open) {
      const prev = document.activeElement;
      setTimeout(() => firstBtn.current?.focus(), 10);
      const onKey = (e) => {
        if (e.key === "Escape") onCancel();
      };
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("keydown", onKey);
        prev?.focus();
      };
    }
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="dialog-overlay"
      aria-modal="true"
      role="dialog"
      aria-labelledby="unsaved-title"
    >
      <div
        ref={dialogRef}
        className="mx-auto mt-40 max-w-md w-full bg-white rounded-2xl p-6 shadow-xl ring-1 ring-emerald-900/10 animate-[scaleIn_.25s_ease] dialog-content"
      >
        <h2
          id="unsaved-title"
          className="text-sm font-semibold text-emerald-900"
        >
          Rời trang?
        </h2>
        <p className="text-xs text-emerald-700/80 mt-2">
          Bạn có thay đổi chưa lưu. Nếu rời đi bản nháp vẫn ở localStorage nhưng
          có thể mất nếu xoá cache.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            ref={firstBtn}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-100 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            Ở lại
          </button>
          <button onClick={onConfirm} className="btn-brand">
            Rời trang
          </button>
        </div>
      </div>
    </div>
  );
}
