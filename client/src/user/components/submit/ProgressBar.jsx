import React from "react";

export default function ProgressBar({ current, total }) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div
      className="mb-6"
      aria-label={`Tiến độ: bước ${current + 1} / ${total}`}
    >
      <div className="flex items-center justify-between text-xs font-medium text-emerald-800 mb-2">
        <span>
          Bước {current + 1} / {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-emerald-900/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-lime-600 transition-all"
          style={{ width: pct + "%" }}
        />
      </div>
    </div>
  );
}
