import React from "react";

export default function RatingStars({ value = 0, count = 0 }) {
  const full = Math.round(value * 10) / 10;
  const stars = Array.from({ length: 5 }).map((_, i) => {
    const active = i + 1 <= Math.round(full);
    return (
      <span
        key={i}
        className={`text-lg ${
          active ? "text-amber-400" : "text-emerald-900/30"
        }`}
        aria-hidden="true"
      >
        ★
      </span>
    );
  });
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Đánh giá trung bình ${full} trên 5 với ${count} lượt`}
    >
      {stars}
      <span className="text-sm font-medium text-emerald-950">{full}</span>
      <span className="text-xs text-emerald-800/60">({count})</span>
    </div>
  );
}
