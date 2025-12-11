/**
 * StatusPill
 * status: draft | pending | review | published | rejected
 * Props: { status, minimal? }
 * Story:
 *  <StatusPill status="published" />
 */
import React from "react";
import { t } from "../../i18n/index.js"; // added

const map = {
  draft: "bg-gray-200 text-gray-700 border-gray-300", // Màu xám cho nháp
  pending: "bg-yellow-200/70 text-yellow-900 border-yellow-300", // Nền vàng cho chờ duyệt
  review: "bg-yellow-200/70 text-yellow-900 border-yellow-300", // Nền vàng cho chờ duyệt (alias)
  published: "bg-emerald-200/70 text-emerald-900 border-emerald-300",
  rejected: "bg-rose-200/70 text-rose-900 border-rose-300",
};

const dotMap = {
  draft: "bg-gray-500",
  pending: "bg-yellow-500",
  review: "bg-yellow-500",
  published: "bg-emerald-600",
  rejected: "bg-rose-600",
};

export default function StatusPill({ status, minimal = false }) {
  const cls = map[status] || map.draft;
  const label = status
    ? t(`status.${status}`, status.charAt(0).toUpperCase() + status.slice(1))
    : t("status.unknown", "Không rõ");
  if (minimal) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border ${cls}`}
      >
        {label}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${cls}`}
      role="status"
      aria-label={`Trạng thái: ${label}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotMap[status]}`}></span>
      {label}
    </span>
  );
}
