import React from "react";

export default function SortBar({ sort, onSort, total }) {
  const sortOptions = [
    { value: "newest", label: "Mới nhất", icon: "🆕" },
    { value: "oldest", label: "Cũ nhất", icon: "📅" },
    { value: "rating", label: "Đánh giá cao", icon: "⭐" },
    { value: "rating-low", label: "Đánh giá thấp", icon: "⭐" },
    { value: "time-asc", label: "Thời gian ít", icon: "⏱️" },
    { value: "time-desc", label: "Thời gian nhiều", icon: "⏰" },
    { value: "title", label: "A-Z", icon: "🔤" },
    { value: "popular", label: "Phổ biến", icon: "🔥" },
  ];

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-emerald-900/10 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-emerald-800/70">
          Sắp xếp:
        </span>
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="px-3 py-1.5 rounded-md border border-emerald-900/15 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="text-xs text-emerald-800/60">{total} công thức</div>
    </div>
  );
}
