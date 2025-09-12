// components/common/GenericReportModal.jsx
import React, { useEffect, useState } from "react";
import useReporting from "../../hooks/useReporting";

const REPORT_REASONS = {
  post: [
    "Nội dung không phù hợp",
    "Spam / Quảng cáo",
    "Ngôn từ tiêu cực",
    "Sai thông tin",
    "Vi phạm bản quyền",
  ],
  recipe: [
    "Công thức sai lệch",
    "Hình ảnh không phù hợp",
    "Spam / Quảng cáo",
    "Vi phạm bản quyền",
    "Nội dung không liên quan",
  ],
  comment: [
    "Ngôn từ tiêu cực",
    "Spam / Quảng cáo",
    "Nội dung không phù hợp",
    "Sai thông tin",
    "Bình luận độc hại",
  ],
};

const TARGET_TYPE_LABELS = {
  post: "bài viết",
  recipe: "công thức",
  comment: "bình luận",
};

export default function GenericReportModal({
  open,
  onClose,
  target,
  targetType = "post",
  onSuccess,
  onLoginRequired,
}) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [useCustomReason, setUseCustomReason] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { isSubmitting, error, submitReport, clearError } = useReporting({
    onSuccess: (result) => {
      onSuccess?.(result);
      onClose?.();
    },
    onLoginRequired,
  });

  const reasons = REPORT_REASONS[targetType] || REPORT_REASONS.post;
  const targetLabel = TARGET_TYPE_LABELS[targetType] || "nội dung";

  // Initialize reason when modal opens (only once)
  useEffect(() => {
    if (open && reasons.length > 0 && !initialized) {
      setReason(reasons[0]);
      setCustomReason("");
      setUseCustomReason(false);
      setInitialized(true);
      clearError();
    } else if (!open && initialized) {
      // Reset state when modal closes
      setReason("");
      setCustomReason("");
      setUseCustomReason(false);
      setInitialized(false);
      clearError();
    }
  }, [open, reasons, clearError, initialized]);

  // Handle escape key
  useEffect(() => {
    if (open) {
      const handleKey = (e) => {
        if (e.key === "Escape") onClose?.();
      };
      window.addEventListener("keydown", handleKey, true);
      return () => window.removeEventListener("keydown", handleKey, true);
    }
  }, [open, onClose]);

  if (!open || !target) return null;

  const getTargetPreview = () => {
    if (targetType === "recipe") {
      return target.title || target.name || "Công thức";
    }
    if (targetType === "comment") {
      return target.content?.substring(0, 100) || "Bình luận";
    }
    return target.content?.substring(0, 100) || "Nội dung";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalReason = useCustomReason ? customReason.trim() : reason;
    if (!finalReason) {
      return;
    }

    const reportData = {
      targetType,
      targetId: target.id?.toString() || target._id?.toString(),
      reason: finalReason,
      description: `Báo cáo ${targetLabel}: "${getTargetPreview()}${
        getTargetPreview().length > 100 ? "..." : ""
      }"`,
    };

    const result = await submitReport(reportData);
    if (!result.success && typeof window !== "undefined") {
      // Gọi hook để hiển thị toast lỗi
      if (typeof handleReportError === "function")
        handleReportError(result.error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Báo cáo ${targetLabel}`}
    >
      <div
        className="absolute inset-0 bg-emerald-950/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-emerald-900/10 space-y-5"
      >
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-emerald-950">
            Báo cáo {targetLabel}
          </h2>
          <p className="text-xs text-emerald-800/70 leading-snug line-clamp-2">
            {getTargetPreview()}
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-emerald-800/60">
              Lý do báo cáo
            </label>

            {!useCustomReason ? (
              <select
                value={reason || reasons[0]}
                onChange={(e) => {
                  setReason(e.target.value);
                }}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            ) : (
              <textarea
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                }}
                placeholder="Nhập lý do cụ thể..."
                disabled={isSubmitting}
                rows={3}
                className="w-full rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/50 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setUseCustomReason(!useCustomReason);
            }}
            disabled={isSubmitting}
            className="text-xs text-emerald-600 hover:text-emerald-700 focus:outline-none focus:underline disabled:opacity-50"
          >
            {useCustomReason ? "Chọn lý do có sẵn" : "Nhập lý do khác"}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-900/5 text-emerald-900 hover:bg-emerald-900/10 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (useCustomReason && !customReason.trim())}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-br from-rose-600 via-rose-600 to-rose-700 text-white focus:outline-none focus:ring-2 focus:ring-rose-400/60 shadow disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
          >
            {isSubmitting && (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
          </button>
        </div>
      </form>
    </div>
  );
}
